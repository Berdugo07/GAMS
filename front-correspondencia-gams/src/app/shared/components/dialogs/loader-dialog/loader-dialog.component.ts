import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'loader-dialog',
  imports: [MatDialogModule, MatProgressSpinnerModule],
  template: `
    <mat-dialog-content>
      <div class="flex items-center gap-x-6">
        <div>
          <mat-spinner [diameter]="60" />
        </div>
        <div class="font-medium">Guardando...</div>
      </div>
    </mat-dialog-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderDialogComponent {}
