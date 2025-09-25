import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { CacheService, SearchInputComponent } from '../../../../shared';
import { InternalProcedure, procedureState } from '../../../domain';
import { InternalDialogComponent } from '../../dialogs';
import { InternalService } from '../../services';

import {
  submissionData,
  SubmissionDialogComponent,
} from '../../../../communications/presentation/dialogs';

interface cache {
  datasource: InternalProcedure[];
  datasize: number;
  limit: number;
  index: number;
  term: string;
}
@Component({
  selector: 'app-internals-manage',
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './internals-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InternalsManageComponent {
  private dialog = inject(MatDialog);
  private internalService = inject(InternalService);
  private cacheService: CacheService<cache> = inject(CacheService);

  displayedColumns: string[] = [
    'send',
    'code',
    'reference',
    'applicant',
    'createdAt',
    'options',
  ];
  datasource = signal<InternalProcedure[]>([]);
  datasize = signal<number>(0);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.saveCache();
    });
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData(): void {
    this.internalService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe((data) => {
        this.datasource.set(data.procedures);
        this.datasize.set(data.length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(InternalDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      autoFocus: false,
    });
    dialogRef
      .afterClosed()
      .subscribe((procedure: InternalProcedure | undefined) => {
        if (!procedure) return;
        this.datasource.update((values) =>
          [procedure, ...values].slice(0, this.limit())
        );
        this.datasize.update((value) => (value += 1));
        this.send(procedure);
      });
  }

  update(item: InternalProcedure) {
    const dialogRef = this.dialog.open(InternalDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data: item,
    });
    dialogRef
      .afterClosed()
      .subscribe((result: InternalProcedure | undefined) => {
        if (!result) return;
        this.datasource.update((values) => {
          const index = values.findIndex(({ id }) => id === item.id);
          if( index === -1) return values;
          values[index] = result;
          return [...values];
        });
      });
  }

  send(procedure: InternalProcedure) {
    const data: submissionData = {
      procedure: {
        id: procedure.id,
        code: procedure.code,
      },
      attachmentsCount: procedure.numberOfDocuments,
      cite: procedure.cite,
      isOriginal: true,
      mode: 'initiate',
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((message) => {
      if (!message) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ id: _id }) => _id === procedure.id);
        values[index].state = procedureState.Revision;
        return [...values];
      });
    });
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  private saveCache(): void {
    this.cacheService.save('internals', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      term: this.term(),
      limit: this.limit(),
      index: this.index(),
    });
  }

  private loadCache(): void {
    const cache = this.cacheService.load('internals');
    if (!cache || !this.cacheService.keepAlive()) return this.getData();
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.term.set(cache.term);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
  }
}
