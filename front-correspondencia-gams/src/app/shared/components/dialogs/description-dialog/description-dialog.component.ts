import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

export interface descriptionDialogProps {
  title: string;
  placeholder: string;
}
@Component({
  selector: 'description-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <div class="py-2">
        <mat-form-field appearance="outline">
          <mat-label>Descripcion</mat-label>
          <textarea
            matInput
            [formControl]="control"
            [placeholder]="data.placeholder"
          ></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button color="warn" mat-dialog-close>Cancelar</button>
      <button
        mat-button
        color="primary"
        [disabled]="control.invalid"
        (click)="accept()"
      >
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionDialogComponent {
  data = inject<descriptionDialogProps>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<DescriptionDialogComponent>);

  control = new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(30),
    ],
  });


  accept(): void {
    this.dialogRef.close(this.control.value);
  }
}
