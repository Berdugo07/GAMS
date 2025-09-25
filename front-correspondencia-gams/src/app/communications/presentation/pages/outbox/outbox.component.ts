import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  BadgeComponent,
  SearchInputComponent,
} from '../../../../shared';

import { OutboxService } from '../../services';
import {
  submissionData,
  submissionResult,
  SubmissionDialogComponent,
  CancelFeedbackDialogComponent,
} from '../../dialogs';
import { Communication, sendStatus } from '../../../domain';
import { HumanizeDurationPipe } from '../../pipes/humanize-duration.pipe';

@Component({
  selector: 'outbox',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatPaginatorModule,
    HumanizeDurationPipe,
    SearchInputComponent,
    BadgeComponent,
  ],
  templateUrl: './outbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './outbox.component.scss',
})
export default class OutboxComponent {
  private dialogRef = inject(MatDialog);
  private alertService = inject(AlertService);
  private outboxService = inject(OutboxService);

  dataSource = signal<Communication[]>([]);
  dataSize = signal<number>(0);
  selection = new SelectionModel<Communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  term = signal<string>('');
  expandedElement: Communication | null;

  readonly displayedColumns = [
    'select',
    'type',
    'code',
    'reference',
    'recipient',
    'time',
    'expand',
    'options',
  ];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.outboxService
      .findAll({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
      })
      .subscribe(({ communications, length }) => {
        this.dataSource.set(communications);
        this.dataSize.set(length);
        this.selection.clear();
      });
  }

  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  send(item: Communication): void {
    const data: submissionData = {
      mode: 'resend',
      communicationId: item.id,
      isOriginal: item.isOriginal,
      attachmentsCount: item.attachmentsCount,
      procedure: { id: item.procedure.ref, code: item.procedure.code },
      isResend: item.status === 'pending' && item.isOriginal,
    };
    const dialogRef = this.dialogRef.open<
      SubmissionDialogComponent,
      submissionData,
      submissionResult
    >(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.handleSubmisionDialogResult(result, item);
    });
  }

  cancelSelection(): void {
    this.cancel(this.selection.selected);
  }

  cancelOne(communication: Communication): void {
    this.cancel([communication]);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource().map((el) => el));
  }

  isButtonEnabledForStatus(status: string): boolean {
    return (
      this.selection.selected.every((el) => el.status === status) &&
      this.selection.selected.length > 0
    );
  }

  isExpanded(element: Communication) {
    return this.expandedElement === element;
  }

  toggle(element: Communication) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  private cancel(items: Communication[]): void {
    const messageProperties =
      items.length === 1
        ? {
            title: '¿Cancelar envio?',
            description: `Se cancelara el envio del tramite ${items[0].procedure.code}`,
          }
        : {
            title: '¿Cancelar envios seleccionados?',
            description: `Solo se pueden cancelar los envios que aun no hayan sido recibidos por el destinatario`,
          };

    this.alertService
      .confirmDialog(messageProperties)
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.outboxService.cancel(items.map(({ id }) => id)))
      )
      .subscribe(({ canceledIds, restoredItems }) => {
        this.removeItemsDataSource(canceledIds);

        if (restoredItems.length > 0) {
          this.dialogRef.open(CancelFeedbackDialogComponent, {
            width: '650px',
            maxWidth: '650px',
            data: restoredItems,
          });
        }
      });
  }

  private handleSubmisionDialogResult(
    result: submissionResult,
    currentItem: Communication
  ): void {
    if (result.error) {
      this.dataSource.update((values) => {
        const index = values.findIndex(({ id }) => id === currentItem.id);
        values[index].status = sendStatus.AutoRejected;
        return [...values];
      });
      return;
    }
    const newItems = result.data ?? [];

    switch (currentItem.status) {
      case sendStatus.Pending:
        this.dataSize.update((value) => (value += newItems.length));
        this.dataSource.update((values) =>
          [...newItems, ...values].splice(0, this.limit())
        );
        break;

      default:
        this.dataSize.update((value) => (value += newItems.length - 1));
        this.dataSource.update((values) =>
          [
            ...newItems,
            ...values.filter(({ id }) => id !== currentItem.id),
          ].slice(0, this.limit())
        );
        break;
    }
  }

  get canDoAction() {
    return this.isButtonEnabledForStatus('pending');
  }

  private removeItemsDataSource(ids: string[]): void {
    this.dataSource.update((values) =>
      values.filter(({ id }) => !ids.includes(id))
    );
    this.dataSize.update((value) => (value -= ids.length));
    this.selection.clear();
    if (this.dataSource().length === 0 && this.dataSize() > 0) {
      this.index.set(0);
      this.getData();
    }
  }
}
