import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import {
  AutocompleteOption,
  AutocompleteComponent,
} from '../../../../../shared';
import { Account } from '../../../../../administration/domain';
import { DocService } from '../../../services/doc.service';
import { Doc } from '../../../../domain';

type validFormfield = 'sender' | 'recipient' | 'via';
type participantOptions = {
  [key in validFormfield]: AutocompleteOption<Account>[];
};
@Component({
  selector: 'app-doc-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    AutocompleteComponent,
  ],
  templateUrl: './doc-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class DocDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private docService = inject(DocService);

  readonly types = [
    { value: 'CI', label: 'COMUNICACION INTERNA' },
    { value: 'CE', label: 'COMUNICACION EXTERNA' },
    { value: 'CIR', label: 'CIRCULAR' },
    { value: 'MEM', label: 'MEMORANDUM' },
  ];

  data?: Doc = inject(MAT_DIALOG_DATA);

  participants = signal<participantOptions>({
    recipient: [],
    sender: [],
    via: [],
  });

  showViaField = signal(false);

  formDoc: FormGroup = this._formBuilder.group({
    type: ['', Validators.required],
    reference: ['', Validators.required],
    sender: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
    recipient: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
    isGeneralCode: [false],
  });

  constructor() {
    effect(() => {
      this._toggleViaField();
    });
  }

  ngOnInit(): void {
    this._loadForm();
  }

  save() {
    const subscription = this.data
      ? this.docService.update(this.data.id, this.formDoc.value)
      : this.docService.create(this.formDoc.value);
    subscription.subscribe((document) => this.dialogRef.close(document));
  }

  searchAccounts(field: validFormfield, term: string) {
    this.formDoc.get(`${field}.fullname`)?.setValue(term);
    if (!term) return;
    this.docService.searchAccounts(term).subscribe((data) => {
      const options: AutocompleteOption<Account>[] = data.map((option) => ({
        text: option.officer?.fullName ?? 'Desvinculado',
        value: option,
      }));
      this.participants.update((values) => ({ ...values, [field]: options }));
    });
  }

  onSelectAcount(path: validFormfield, account: Account): void {
    this.formDoc.get(path)?.patchValue({
      fullname: account.officer?.fullName,
      jobtitle: account.jobtitle,
    });
  }

  private _toggleViaField() {
    if (this.showViaField()) {
      const { fullname = '', jobtitle = '' } = this.data?.via ?? {};
      this.formDoc.addControl(
        'via',
        this._formBuilder.group({
          fullname: [fullname, Validators.required],
          jobtitle: [jobtitle, Validators.required],
        })
      );
    } else {
      this.formDoc.removeControl('via');
    }
  }

  private _loadForm() {
    if (!this.data) return;
    this.formDoc.removeControl('type');
    this.formDoc.removeControl('isGeneralCode');
    this.formDoc.patchValue(this.data);
    if (this.data.via) this.showViaField.set(true);
  }
}
