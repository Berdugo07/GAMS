import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

interface RestoredItem {
  restoredType: 'inbox' | 'administration';
  code: string;
}

@Component({
  selector: 'app-cancel-feedback-dialog',
  imports: [MatDialogModule, CommonModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Trámites cancelados</h2>

    <mat-dialog-content>
      <p class="mb-4 text-lg">
        Los siguientes trámites han sido restaurados para su reenvio:
      </p>
      <div class="overflow-x-auto">
        <table class="min-w-full border rounded-md">
          <thead class="text-left text-lg">
            <tr>
              <th class="py-2 px-4 border-b">Alterno</th>
              <th class="py-2 px-4 border-b">Ubicación actual</th>
            </tr>
          </thead>
          <tbody>
            @for (item of dialogData; track $index) {
            <tr>
              <td class="py-2 px-4 border-b border-2 text-lg">
                {{ item.code }}
              </td>
              <td class="py-2 px-4 border-b border-2 text-lg">
                {{ item.restoredType }}
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelFeedbackDialogComponent {
  dialogData: RestoredItem[] = inject(MAT_DIALOG_DATA);
}
