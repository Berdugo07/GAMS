import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';

import { DocDialogComponent } from './doc-dialog/doc-dialog.component';
import {
  DocxService,
  YearPickerComponent,
  SearchInputComponent,
} from '../../../../shared';
import { Doc, DOCUMENT_TYPES } from '../../../domain';
import { DocService } from '../../services';

@Component({
  selector: 'app-docs',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatToolbarModule,
    OverlayModule,
    MatSelectModule,
    MatTooltipModule,
    SearchInputComponent,
    YearPickerComponent,
    MatPaginatorModule,
  ],
  templateUrl: './docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocsComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private docService = inject(DocService);
  private wordGeneratorService = inject(DocxService);

  readonly documentTypes = [{ value: null, label: 'TODOS' }, ...DOCUMENT_TYPES];
  readonly displayedColumns: string[] = [
    'cite',
    'reference',
    'sender',
    'procedure',
    'date',
    'options',
  ];

  datasource = signal<Doc[]>([]);
  datasize = signal<number>(0);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  isFilterOpen = false;
  filterForm: FormGroup = inject(FormBuilder).group({
    year: [null],
    type: [null],
  });

  ngOnInit(): void {
    this.getData();
  }

  create() {
    const dialogRef = this.dialogRef.open(DocDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
    });
    dialogRef.afterClosed().subscribe((result: Doc) => {
      if (!result) return;
      this.datasize.update((value) => (value += 1));
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [result, ...values];
      });
      this.generateTemplate(result);
    });
  }

  update(element: Doc) {
    const dialogRef = this.dialogRef.open(DocDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data: element,
    });
    dialogRef.afterClosed().subscribe((result: Doc) => {
      if (!result) return;
      this.datasource.update((values) => {
        const indexFound = values.findIndex(({ id }) => id === result.id);
        values[indexFound] = result;
        return [...values];
      });
    });
  }

  getData() {
    this.docService
      .findAll({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
        ...this.filterForm.value,
      })
      .subscribe(({ documents, length }) => {
        this.datasource.set(documents);
        this.datasize.set(length);
      });
  }

  generateTemplate(item: Doc) {
    this.wordGeneratorService.generateDocument(item);
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  filter() {
    this.index.set(0);
    this.isFilterOpen = false;
    this.getData();
  }

  reset() {
    this.filterForm.reset();
    this.isFilterOpen = false;
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }
}
