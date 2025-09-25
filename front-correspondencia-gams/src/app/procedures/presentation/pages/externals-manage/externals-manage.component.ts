import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { CacheService, SearchInputComponent } from '../../../../shared';
import { ExternalProcedure, procedureState } from '../../../domain';
import { ExternalService } from '../../services';
import {
  submissionData,
  SubmissionDialogComponent,
} from '../../../../communications/presentation/dialogs';
import { ExternalDialogComponent } from '../../dialogs';

interface cache {
  datasource: ExternalProcedure[];
  datasize: number;
  term: string;
  limit: number;
  index: number;
}
@Component({
  selector: 'app-externals-manage',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './externals-manage.component.html',
})
export default class ExternalsManageComponent {
  private dialogRef = inject(MatDialog);
  private externalService = inject(ExternalService);
  private cacheService: CacheService<cache> = inject(CacheService);

  datasource = signal<ExternalProcedure[]>([]);
  datasize = signal<number>(0);
  displayedColumns: string[] = [
    'send',
    'code',
    'reference',
    'applicant',
    'date',
    'options',
  ];

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
    this.externalService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ procedures, length }) => {
        this.datasource.set(procedures);
        this.datasize.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialogRef.open(ExternalDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
    });
    dialogRef
      .afterClosed()
      .subscribe((result: ExternalProcedure | undefined) => {
        if (!result) return;
        this.datasource.update((values) =>
          [result, ...values].slice(0, this.limit())
        );
        this.datasize.update((value) => (value += 1));
        this.send(result);
      });
  }

  update(item: ExternalProcedure): void {
    const dialogRef = this.dialogRef.open(ExternalDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data: item,
    });
    dialogRef
      .afterClosed()
      .subscribe((result: ExternalProcedure | undefined) => {
        if (!result) return;
        this.datasource.update((values) => {
          const index = values.findIndex(({ id }) => id === result.id);
          if (index === -1) return values;
          values[index] = result;
          return [...values];
        });
      });
  }

  send(item: ExternalProcedure): void {
    const transfer: submissionData = {
      procedure: { id: item.id, code: item.code },
      attachmentsCount: item.numberOfDocuments,
      isOriginal: true,
      mode: 'initiate',
      reference: 'PARA SU ATENCIÓN',
    };
    const dialogRef = this.dialogRef.open(SubmissionDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data: transfer,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ id: _id }) => _id === item.id);
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
    this.cacheService.save('externals', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      term: this.term(),
      limit: this.limit(),
      index: this.index(),
    });
  }

  private loadCache(): void {
    const cache = this.cacheService.load('externals');
    if (!cache || !this.cacheService.keepAlive()) return this.getData();
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.term.set(cache.term);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
  }
}
