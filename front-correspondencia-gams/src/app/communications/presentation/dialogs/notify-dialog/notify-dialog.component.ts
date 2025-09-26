import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Communication } from '../../../domain';
import { NgIf } from '@angular/common'; 

@Component({
  selector: 'app-notify-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    NgIf, // Añade NgIf a los imports
  ],
  template: `
    <h2 mat-dialog-title>
      Notificación de {{ data.length > 1 ? 'trámites' : 'trámite' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="notifyForm">
        <div class="flex flex-col gap-y-4">
          <div class="text-md mb-4">
            @if(data.length > 1) {
              Se notificará un total de {{ data.length }} trámites.
            } @else {
              El trámite {{ data[0].procedure.code }} será notificado.
            }
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Observación</mat-label>
            <textarea
              matInput
              formControlName="observation"
              rows="4"
              placeholder="Ingrese la observación"
            ></textarea>
            
            <!-- Usa *ngIf en lugar de @if para compatibilidad -->
            <mat-error *ngIf="observation?.hasError('required')">
              La observación es obligatoria.
            </mat-error>
            <mat-error *ngIf="observation?.hasError('minlength')">
              Debe tener al menos 4 caracteres.
            </mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button color="warn" mat-dialog-close>Cancelar</button>
      <button
        mat-button
        color="primary"
        [disabled]="notifyForm.invalid"
        (click)="send()"
      >
        Enviar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<NotifyDialogComponent>);
  data: Communication[] = inject(MAT_DIALOG_DATA);

  notifyForm: FormGroup = this.fb.nonNullable.group({
    observation: ['', [Validators.required, Validators.minLength(4)]],
  });

  get observation() {
    return this.notifyForm.get('observation');
  }

  send() {
  if (this.notifyForm.valid) {
    const ids = this.data.map(item => item.procedure.code);
    console.log('Enviando IDs:', ids); // Verifica en la consola del navegador
    this.dialogRef.close({
      ids: ids,
      observation: this.notifyForm.value.observation,
    });
  }
}
}