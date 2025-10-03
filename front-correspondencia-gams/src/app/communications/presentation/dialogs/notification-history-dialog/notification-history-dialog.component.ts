import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationHistory } from '../../services/notification.service';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

@Component({
  selector: 'app-notification-history-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgFor,
    NgIf,
    DatePipe,
    FormsModule,
    MatPaginatorModule
  ],
  template: `
    <h2 mat-dialog-title>Notificación de trámite</h2>

    <mat-dialog-content>
      <div class="text-md mb-4">
        Notificaciones mandadas al trámite
        <strong>{{ data.procedureCode }}</strong>
      </div>

      <!-- Filtro por fecha con botón sencillo -->
      <div class="flex items-center gap-2 mb-4">
        <input
          type="date"
          [(ngModel)]="selectedDate"
          (ngModelChange)="applyDateFilter()"
          class="border rounded px-2 py-1"
        />

        <!-- Botón estilo texto/plano -->
        <button
          mat-button
          color="primary"
          (click)="applyDateFilter()"
        >
          Filtrar
        </button>

        <button
          mat-button
          color="warn"
          *ngIf="selectedDate"
          (click)="clearDateFilter()"
        >
          Limpiar
        </button>
      </div>

      <div class="flex flex-col gap-y-4 max-h-96 overflow-y-auto">
        <ng-container *ngIf="notifications && notifications.length > 0; else noRecords">
          <div *ngFor="let item of notifications" class="border-b pb-2">
            <div class="text-sm text-gray-600">
              {{ item.createdAt | date:'short' }} - <b>{{ item.applicantName }}</b>
            </div>
            <div class="text-base">
              <strong>Observación:</strong> {{ item.observation }}
            </div>
            <div class="text-xs text-gray-500">
              Estado: {{ item.status }}
            </div>
          </div>
        </ng-container>

        <ng-template #noRecords>
          <div class="text-center text-gray-500 italic">
            Sin registro de notificaciones
          </div>
        </ng-template>
      </div>

      <!-- Paginador en español -->
      <mat-paginator [length]="total"
                     [pageSize]="limit"
                     [hidePageSize]="true"
                     [showFirstLastButtons]="true"
                     (page)="onPageChange($event)">
      </mat-paginator>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Cerrar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationHistoryDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA) as { procedureCode: string };
  private notificationService = inject(NotificationService);
  private paginatorIntl = inject(MatPaginatorIntl);

  notifications: NotificationHistory[] = [];
  page = 1;
  limit = 4; // Items por página
  total = 0;
  selectedDate?: string;

  constructor() {
    // Traducir el paginador al español
    this.paginatorIntl.itemsPerPageLabel = 'Ítems por página';
    this.paginatorIntl.nextPageLabel = 'Siguiente';
    this.paginatorIntl.previousPageLabel = 'Anterior';
    this.paginatorIntl.firstPageLabel = 'Primera página';
    this.paginatorIntl.lastPageLabel = 'Última página';
    this.paginatorIntl.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) return `0 de ${length}`;
      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, length);
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };
  }

  ngOnInit() {
    this.loadPage(this.page);
  }

  loadPage(page: number) {
    this.notificationService
      .getHistory(this.data.procedureCode, page, this.limit, this.selectedDate)
      .subscribe({
        next: (res) => {
          this.notifications = res.items;
          this.total = res.total;
          this.page = page;
        },
        error: (err) => console.error('Error al cargar notificaciones', err),
      });
  }

  onPageChange(event: PageEvent) {
    this.loadPage(event.pageIndex + 1);
  }

  applyDateFilter() {
    this.page = 1; // volver a la primera página al filtrar
    this.loadPage(this.page);
  }

  clearDateFilter() {
    this.selectedDate = undefined;
    this.page = 1;
    this.loadPage(this.page);
  }
}
