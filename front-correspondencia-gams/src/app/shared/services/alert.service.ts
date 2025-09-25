import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs'
import { ConfirmDialogComponent, confirmDialogData } from '../components/dialogs/confirm-dialog/confirm-dialog.component';
import { DescriptionDialogComponent, descriptionDialogProps } from '../components/dialogs/description-dialog/description-dialog.component';
import { MessageDialogComponent, messageDialogProps } from '../components/dialogs/message-dialog/message-dialog.component';
@Injectable({
  providedIn: 'root',
})
export class AlertService {

  private dialogRef = inject(MatDialog);

  confirmDialog(data: confirmDialogData): Observable<boolean> {
    return this.dialogRef
      .open(ConfirmDialogComponent, {
        data: data,
        disableClose: true,
      })
      .afterClosed();
  }

  descriptionDialog(data: descriptionDialogProps): Observable<string | null> {
    return this.dialogRef
      .open(DescriptionDialogComponent, {
        data: data,
        disableClose: true,
        width: '800px',
      })
      .afterClosed();
  }

  messageDialog(data: messageDialogProps): Observable<void> {
    return this.dialogRef
      .open(MessageDialogComponent, {
        data: data,
        width: '800px',
      })
      .afterClosed();
  }



}
