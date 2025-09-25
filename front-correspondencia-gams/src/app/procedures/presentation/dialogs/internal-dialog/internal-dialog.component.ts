import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import {
  AutocompleteComponent,
  AutocompleteOption,
  selectOption,
} from '../../../../shared';

import { InternalService, ProfileService } from '../../services';
import { doc } from '../../../../communications/infrastructure';
import { Account } from '../../../../administration/domain';
import { InternalProcedure } from '../../../domain';

type validFormfield = 'sender' | 'recipient';
type participantOptions = {
  [key in validFormfield]: AutocompleteOption<Account>[];
};
@Component({
  selector: 'app-internal-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    AutocompleteComponent,
  ],
  templateUrl: './internal-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalDialogComponent {
  private account = inject(ProfileService).account();
  private internalService = inject(InternalService);
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);

  data?: InternalProcedure = inject(MAT_DIALOG_DATA);
  officers = signal<participantOptions>({ sender: [], recipient: [] });
  documents = signal<selectOption<doc>[]>([]);

  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    cite: [this.account?.dependencia.codigo],
    sender: this.formBuilder.group({
      fullname: [this.account?.officer?.fullName, Validators.required],
      jobtitle: [this.account?.jobtitle, Validators.required],
    }),
    recipient: this.formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    const observable = this.data
      ? this.internalService.update(this.data.id, this.formProcedure.value)
      : this.internalService.create(this.formProcedure.value);
    observable.subscribe((procedure) => this.dialogRef.close(procedure));
  }

  searchAccounts(field: validFormfield, term: string): void {
    this.formProcedure.get(`${field}.fullname`)?.setValue(term);
    if (!term) return;
    this.internalService.searchAccounts(term).subscribe((data) => {
      const options: AutocompleteOption<Account>[] = data.map((el) => ({
        text: el.officer?.fullName ?? 'Desvinculado',
        value: el,
      }));
      this.officers.update((values) => ({ ...values, [field]: options }));
    });
  }

  onSelectAcount(field: validFormfield, account: Account): void {
    this.formProcedure.get(`${field}`)?.patchValue({
      fullname: account.officer?.fullName,
      jobtitle: account.jobtitle,
    });
  }

  private loadForm() {
    if (!this.data) return;
    this.formProcedure.patchValue(this.data);
  }
}
