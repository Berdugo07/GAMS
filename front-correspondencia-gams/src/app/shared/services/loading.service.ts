import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

import { BehaviorSubject } from 'rxjs';

import { LoaderDialogComponent } from '../components/dialogs/loader-dialog/loader-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private dialogRef = inject(MatDialog);
  private uploadingDialog: MatDialogRef<LoaderDialogComponent, void> | null = null;
  private _isLoading = new BehaviorSubject<boolean>(false);
  private totalRequests = 0;

  isLoading = toSignal(this._isLoading);

  toggleLoading(show: boolean) {
    if (show) {
      this.totalRequests++;
      this._isLoading.next(true);
    } else {
      this.totalRequests = Math.max(0, this.totalRequests - 1);
      if (this.totalRequests === 0) {
        this._isLoading.next(false);
      }
    }
  }

  toggleUploading(show: boolean): void {
    if (show) {
      if (this.uploadingDialog) return;
      this.uploadingDialog = this.dialogRef.open(LoaderDialogComponent, {
        disableClose: true,
      });
      this.uploadingDialog.afterClosed().subscribe(() => {
        this.uploadingDialog = null;
      });
    } else {
      this.uploadingDialog?.close();
    }
  }
}
