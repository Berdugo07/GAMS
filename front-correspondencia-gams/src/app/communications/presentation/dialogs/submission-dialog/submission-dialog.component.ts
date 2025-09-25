import { CommonModule } from '@angular/common';

import {
  OnInit,
  inject,
  signal,
  effect,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  Validators,
  FormGroup,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import {
  distinctUntilChanged,
  BehaviorSubject,
  Observable,
  switchMap,
  debounce,
  filter,
  timer,
  map,
  of,
} from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { SocketService } from '../../../../layout/presentation/services';
import {
  AlertService,
  selectOption,
  SelectSearchComponent,
} from '../../../../shared';
import { InboxService, OutboxService } from '../../services';
import { Communication, onlineAccount, recipient } from '../../../domain';
import { doc } from '../../../infrastructure';

export interface submissionResult {
  error?: string;
  data?: Communication[];
}
export interface submissionData {
  communicationId?: string;
  attachmentsCount: string;
  isOriginal: boolean;
  procedure: procedureProps;
  cite?: string;
  isResend?: boolean;
  mode: communicationMode;
  reference?: string;
}
interface procedureProps {
  id: string;
  code: string;
}

export type communicationMode = 'initiate' | 'forward' | 'resend';
@Component({
  selector: 'submission-dialog',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule,
    SelectSearchComponent,
  ],
  templateUrl: './submission-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialogRef: MatDialogRef<SubmissionDialogComponent, submissionResult> =
    inject(MatDialogRef);
  private inboxService = inject(InboxService);
  private alertService = inject(AlertService);
  private socketService = inject(SocketService);
  private outboxService = inject(OutboxService);

  data: submissionData = inject(MAT_DIALOG_DATA);
  accounts = signal<onlineAccount[]>([]);
  documents = signal<selectOption<doc>[]>([]);
  institutions = toSignal(this.inboxService.getInstitucions(), {
    initialValue: [],
  });
  dependencies = signal<selectOption<string>[]>([]);
  dependencyId = signal<string | null>(null);

  formSubmission: FormGroup = this._formBuilder.group({
    reference: [this.data.reference, Validators.required],
    attachmentsCount: [this.data.attachmentsCount, Validators.required],
    internalNumber: [''],
    priority: [0, Validators.required],
  });
  recipients = signal<recipient[]>([]);

  filterRecipientCtrl = new FormControl<string>('', { nonNullable: true });
  filteredReceivers$ = new BehaviorSubject<onlineAccount[]>([]);

  isCopyEnabled = computed<boolean>(() => {
    if (this.data.isResend) return true;
    if (!this.data.isOriginal) return this.recipients().length === 0;
    return this.recipients().some(({ isOriginal }) => isOriginal);
  });

  isOriginalEnabled = computed<boolean>(() => {
    if (this.data.isResend || !this.data.isOriginal) return false;
    return this.recipients().every(({ isOriginal }) => !isOriginal);
  });

  isConfigValid = computed<boolean>(() => {
    if (this.data.isResend) {
      return this.selectedReceivers().length >= 1;
    }
    return this.data.isOriginal
      ? this.selectedReceivers().some(({ isOriginal }) => isOriginal)
      : this.selectedReceivers().length === 1;
  });

  public selectedReceivers = signal<any[]>([]);

  readonly prioritys = [
    { value: 0, label: 'Normal' },
    { value: 1, label: 'Urgente' },
  ];

  constructor() {
    effect(() => {
      this.filteredReceivers$.next(this.accounts());
    });
  }

  ngOnInit(): void {
    this.setFilterRecipientsControl();
  }

  showConfirmSend(): void {
    this.alertService
      .confirmDialog({
        title: `¿Confirmar Remision?`,
        description: `Se remitira el tramite ${this.data.procedure.code}`,
      })
      .subscribe((result) => {
        if (result) {
          this.send();
        }
      });
  }

  selectRecipient(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value;
    this.filterRecipientCtrl.setValue('');
    event.option.deselect();

    if (this.selectedReceivers().some(({ id }) => id === user.id)) return;

    if (this.data.isOriginal) {
      if (this.data.isResend) {
        this.selectedReceivers.update((values) => [
          ...values,
          { ...user, isOriginal: false },
        ]);
      } else {
        this.selectedReceivers.update((values) => {
          const hasOriginal = values.some(({ isOriginal }) => isOriginal);
          return [
            ...values,
            { ...user, isOriginal: hasOriginal ? false : true },
          ];
        });
      }
    } else {
      this.selectedReceivers.set([{ ...user, isOriginal: false }]);
    }
  }

  removeRecipient(user: recipient): void {
    this.selectedReceivers.update((values) =>
      values.filter(({ id }) => id !== user.id)
    );
  }

  send(): void {
    this.outboxService
      .create(
        {
          ...this.formSubmission.value,
          communicationId: this.data.communicationId,
          procedureId: this.data.procedure.id,
          recipients: this.selectedReceivers().map(({ id, isOriginal }) => ({
            accountId: id,
            isOriginal,
          })),
        },
        this.data.mode
      )
      .subscribe((communications) =>
        this.dialogRef.close({ data: communications })
      );
  }

  getDependencies(institutionId: string) {
    this.dependencyId.set(null);
    this.inboxService
      .getDependenciesInInstitution(institutionId)
      .subscribe((data) => this.dependencies.set(data));
  }

  getRecipientsByDependency(dependencyId: string | null): void {
    this.dependencyId.set(dependencyId);
    if (!dependencyId) {
      this.accounts.set([]);
      return;
    }
    this.inboxService
      .searchRecipientsAccounts(dependencyId)
      .pipe(map((accounts) => this.checkOnlineAccounts(accounts)))
      .subscribe((accounts) => this.accounts.set(accounts));
  }

  private setFilterRecipientsControl(): void {
    this.filterRecipientCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        debounce(() => timer(this.dependencyId() ? 0 : 350)),
        filter((value) => {
          const isString = typeof value === 'string';
          // * for filter in backend, term should not be empty
          return isString && (!!this.dependencyId() || value.trim().length > 0);
        }),
        switchMap((term) => {
          return this.dependencyId()
            ? this.filterLocalAccounts(term)
            : this.filterServerAccount(term);
        })
      )
      .subscribe((recipients) => this.filteredReceivers$.next(recipients));
  }

  private filterLocalAccounts(term: string): Observable<onlineAccount[]> {
    const lowerTerm = term.toLowerCase();
    const options = lowerTerm
      ? this.accounts().filter(({ fullname, jobtitle }) =>
          [fullname, jobtitle].some((field) =>
            field.toLowerCase().includes(lowerTerm)
          )
        )
      : this.accounts();
    return of(options);
  }

  private filterServerAccount(term: string): Observable<onlineAccount[]> {
    if (!term) return of([]);
    return this.inboxService
      .searchRecipientsAccounts(term)
      .pipe(map((accounts) => this.checkOnlineAccounts(accounts)));
  }

  private checkOnlineAccounts(accounts: onlineAccount[]) {
    return accounts.map((receiver) => ({
      ...receiver,
      online: this.socketService.currentOnlineUsers.some(
        ({ userId }) => userId === receiver.userId
      ),
    }));
  }
}
