import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface confirmDialogData {
  title: string;
  description: string;
}
@Component({
    selector: 'app-confirm-dialog',
    imports: [MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="text-lg py-2">{{ data.description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" [mat-dialog-close]="false">
        Cancelar
      </button>
      <button
        mat-button
        color="primary"
        [mat-dialog-close]="true"
        cdkFocusInitial
      >
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  data = inject<confirmDialogData>(MAT_DIALOG_DATA);
}
