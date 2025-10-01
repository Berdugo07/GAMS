import { CommonModule } from '@angular/common';
import {
  OnInit,
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';


import { SelectionModel } from '@angular/cdk/collections';
import { OverlayModule } from '@angular/cdk/overlay';
import { ToastService } from '../../../../shared/services/toast.service';
import { NotificationClientService } from '../../../../shared/services/notification-client.service';
import { SocketService } from '../../../../layout/presentation/services/socket.service';
import { NotifyDialogComponent } from '../../dialogs/notify-dialog/notify-dialog.component';

import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  CacheService,
  SearchInputComponent,
} from '../../../../shared';

import {
  inboxCache,
  Communication,
  sendStatus,
  invalidCommunicationsError,
  notFoundCommunicationsError,
} from '../../../domain';
import { procedureGroup } from '../../../../procedures/domain';
import { InboxService } from '../../services';
import {
  submissionData,
  ArchiveDialogComponent,
  SubmissionDialogComponent,
} from '../../dialogs';

interface ObservationResult {
  id: string;
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-inbox',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    SearchInputComponent,
    
  ],
  templateUrl: './inbox.component.html',
  styles: `
    .mail-pending {
      background-color: #fe5f55;
      color: white;

      a {
        color: white;
        font-weight: bold;
      }
      
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export default class InboxComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);
  private inboxService = inject(InboxService);
  private socketService = inject(SocketService);
  private alertService = inject(AlertService);
  private cacheService: CacheService<inboxCache> = inject(CacheService);
  // private pdfService = inject(PdfService);
  private toastService = inject(ToastService);
  private notificationClient = inject(NotificationClientService);

  datasource = signal<Communication[]>([]);
  datasize = signal<number>(0);
  selection = new SelectionModel<Communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');
  isOpen = false;

  filterForm: FormGroup = this.formBuilder.group({
    group: [],
    isOriginal: [],
  });

  status = signal<sendStatus | 'all'>('all');

  readonly displayedColumns: string[] = [
    'select',
    'priority',
    'group',
    'code',
    'reference',
    'emitter',
    'sentDate',
    'options',
  ];

  readonly groups = [
    { value: procedureGroup.External, label: 'Externos' },
    { value: procedureGroup.Internal, label: 'Internos' },
    { value: procedureGroup.Procurement, label: 'Contrataciones' },
  ];

  readonly documentTypes = [
    { value: true, label: 'Original' },
    { value: false, label: 'Copia' },
  ];

  constructor() {
  this.destroyRef.onDestroy(() => this.saveCache());
  this.listenNewCommunications();
  this.listenCancelCommunications();
  this.listenToWhatsAppNotifications(); 
}


  ngOnInit(): void {
    this.loadCache();
  }

  getData(): void {
    this.inboxService
      .getInbox({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
        ...this.filterForm.value,
        ...(this.status() !== 'all' && { status: this.status() }),
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications);
        this.datasize.set(length);
        this.selection.clear();
      });
  }
send(item: Communication) {
  const data: submissionData = {
    mode: 'forward',
    communicationId: item.id,
    procedure: { id: item.procedure.ref, code: item.procedure.code },
    attachmentsCount: item.attachmentsCount,
    isOriginal: item.isOriginal,
  };
  
  const dialogRef = this.dialogRef.open(SubmissionDialogComponent, {
    maxWidth: '1100px',
    width: '1100px',
    data,
  });
dialogRef.afterClosed().subscribe((result: any) => {
  if (!result) return;

  if (result.success) {
    this.removeItemsDataSource([item.id]);

    if (result.messageId) {
      setTimeout(() => {
        this.checkWhatsAppStatus(result.messageId, item.procedure.code);
      }, 2000);
    }
  }
});}

private checkWhatsAppStatus(messageId: string, procedureCode: string) {
  console.log(`Verificando estado del mensaje ${messageId} para el trámite ${procedureCode}`);
  
  this.toastService.showToast({
    title: 'Estado de WhatsApp',
    description: `Mensaje para ${procedureCode} enviado correctamente`,
    severity: 'info'
  });
}
  accept(items: Communication[]): void {
    this.alertService
      .confirmDialog({
        title:
          items.length === 1
            ? `¿Recibir tramite ${items[0].procedure.code}?`
            : `¿Recibir los tramites seleccionados?`,
        description: 'Solo debe recibir tramites que haya recibido en fisico',
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.inboxService.accept(items.map(({ id }) => id)))
      )
      .subscribe({
        next: ({ ids, receivedDate }) => {
          this.updateItems(ids, {
            status: sendStatus.Received,
            receivedDate,
          });
        },
        error: (error) => {
          this.handleHttpErrors(error);
        },
      });
  }

  reject(items: Communication[]): void {
    // const selection = items.map(({ id }) => id);
    // this.alertService
    //   .descriptionDialog({
    //     title:
    //       items.length === 1
    //         ? `¿Rechazar tramite ${items[0].procedure.code}?`
    //         : `¿Rechazar los tramites seleccionados?`,
    //     placeholder: 'Ingrese una descripcion clara del motivo del rechazo',
    //   })
    //   .pipe(
    //     filter((description) => !!description),
    //     switchMap((description) =>
    //       this.inboxService.reject(selection, description!)
    //     )
    //   )
    //   .subscribe({
    //     next: ({ ids }) => {
    //       this.removeItems(ids);
    //     },
    //     error: (error) => {
    //       if (error instanceof HttpErrorResponse) {
    //         this.handleHttpErrors(error);
    //       }
    //     },
    //   });
  }

archive(items: Communication[]) {
  const dialogRef = this.dialogRef.open(ArchiveDialogComponent, {
    width: '600px',
    data: items,
  });
  
  dialogRef.afterClosed().subscribe((result: string[]) => {
    if (!result) return;
    
    this.removeItemsDataSource(result);
    
    this.toastService.showToast({
      title: 'Elementos archivados',
      description: `Se archivaron ${result.length} elemento(s)`,
      severity: 'success'
    });
  });
}


  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  filterByForm() {
    this.index.set(0);
    this.isOpen = false;
    this.getData();
  }

  filterByStatus() {
    this.index.set(0);
    this.getData();
  }

  reset() {
    this.filterForm.reset();
    this.isOpen = false;
    this.getData();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource().length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.datasource());
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  isButtonEnabledForStatus(status: string): boolean {
    return (
      this.selection.selected.every((el) => el.status === status) &&
      this.selection.selected.length > 0
    );
  }

  private listenNewCommunications(): void {
    this.socketService
      .listenNewCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item) => {
        this.datasource.update((values) =>
          [item, ...values].slice(0, this.limit()).sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return (
              new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()
            );
          })
        );
        this.datasize.update((length) => (length += 1));
      });
  }

  private listenCancelCommunications() {
    this.socketService
      .listenCancelCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.removeItemsDataSource([id]);
      });
  }

  private handleHttpErrors(error: HttpErrorResponse): void {
    switch (error.status) {
      case 404:
        const { notFoundIds } = error.error as notFoundCommunicationsError;
        this.alertService.messageDialog({
          title:
            notFoundIds.length === 1
              ? 'Elemento no encontrado'
              : 'Algunos de los elementos seleccionados no existen',
          description: 'El remitente ha cancelado el envio',
        });
        this.removeItemsDataSource(notFoundIds);
        break;

      case 422:
        const { invalidItems } = error.error as invalidCommunicationsError;
        this.alertService.messageDialog({
          title:
            invalidItems.length === 1
              ? 'El elemento seleccionado es invalido'
              : 'Algunos de los elementos seleccionados son invalidos',
          list: invalidItems.map(({ code }) => `Tramite: ${code}`),
        });
        break;
      default:
        break;
    }
  }

  private removeItemsDataSource(ids: string[]): void {
    this.datasource.update((items) =>
      items.filter(({ id }) => !ids.includes(id))
    );
    this.datasize.update((length) => (length -= ids.length));
    this.selection.clear();
    if (this.datasource().length === 0 && this.datasize() > 0) {
      this.index.set(0);
      this.getData();
    }
  }

  private updateItems(ids: string[], props: Partial<Communication>) {
    const idSet = new Set(ids);
    this.datasource.update((values) =>
      values.map((item) => (idSet.has(item.id) ? item.copyWith(props) : item))
    );
    this.selection.clear();
  }

  private saveCache(): void {
    this.cacheService.save('inbox', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      limit: this.limit(),
      index: this.index(),
      form: this.filterForm.value,
      term: this.term(),
      status: this.status(),
    });
  }

  private loadCache(): void {
    const cache = this.cacheService.load('inbox');
    if (!cache || !this.cacheService.keepAlive()) return this.getData();
    this.term.set(cache.term);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
    this.status.set(cache.status);
    this.datasize.set(cache.datasize);
    this.datasource.set(cache.datasource);
    this.filterForm.patchValue(cache.form);
  }

  get canDoPendingAction(): boolean {
    return this.isButtonEnabledForStatus('pending');
  }

  get canDoReceivedAction(): boolean {
    return this.isButtonEnabledForStatus('received');
  }

private listenToWhatsAppNotifications(): void {
  this.socketService.listen('whatsappNotification')
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((notification: { procedureId: string; success: boolean }) => {
      this.toastService.showToast({
        title: notification.success ? 'WhatsApp enviado' : 'Error al enviar WhatsApp',
        description: `Trámite ${notification.procedureId}`,
        severity: notification.success ? 'success' : 'error'
      });
    });
}
  notify(items: Communication[]) {
  const dialogRef = this.dialogRef.open(NotifyDialogComponent, {
    width: '600px',
    data: items,
  });

  dialogRef.afterClosed().subscribe((result: { ids: string[]; observation: string } | undefined) => {
    if (!result) return;

    this.notificationClient.notify(result.ids, result.observation).subscribe({
      next: (results) => {
        results.forEach(res => {
          this.toastService.showToast({
            title: res.success ? 'Notificación enviada' : 'Error en notificación',
            description: `Trámite ${res.id}: ${res.message}`,
            severity: res.success ? 'success' : 'error'
          });
        });
      },
      error: () => {
        this.toastService.showToast({
          title: 'Error',
          description: 'No se pudo enviar la notificación al servidor',
          severity: 'error'
        });
      }
    });
  });
}

  }

