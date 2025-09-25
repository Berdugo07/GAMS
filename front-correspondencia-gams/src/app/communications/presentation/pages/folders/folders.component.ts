import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { filter, switchMap } from 'rxjs';

import { FolderDialogComponent } from './folder-dialog/folder-dialog.component';
import { FolderService } from '../../services/folder.service';
import { folder } from '../../../infrastructure';
import {
  AlertService,
  CacheService,
  RestoreScrollDirective,
} from '../../../../shared';

interface cache {
  folders: folder[];
  term: string;
}
@Component({
  selector: 'app-folders',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    RestoreScrollDirective,
  ],
  templateUrl: './folders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .box-folder{
      background: var(--mat-sys-surface-container);
    }
    .box-folder:hover {
      background:var(--mat-sys-surface-dim);
    }
  `,
})
export default class FoldersComponent implements OnInit {
  private detroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private cacheService: CacheService<cache> = inject(CacheService);

  folders = signal<folder[]>([]);
  term = signal<string>('');
  isLoading = signal<boolean>(false);
  filteredFolders = computed(() =>
    this.term()
      ? this.folders().filter(({ name }) =>
          name.toLowerCase().includes(this.term().toLowerCase())
        )
      : this.folders()
  );

  constructor(
    private dialog: MatDialog,
    private archiveService: FolderService
  ) {
    this.detroyRef.onDestroy(() => {
      this.saveCache();
    });
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData() {
    this.isLoading.set(true);
    this.archiveService.getFolders().subscribe((folders) => {
      this.folders.set(folders);
      this.isLoading.set(false);
    });
  }

  create() {
    const dialogRef = this.dialog.open(FolderDialogComponent, {
      width: '500px',
      maxWidth: '500px',
    });
    dialogRef.afterClosed().subscribe((folder) => {
      if (!folder) return;
      this.folders.update((values) => [folder, ...values]);
    });
  }

  delete(id: string, event: Event) {
    event.stopPropagation();
    this.alertService
      .confirmDialog({
        title: '¿Eliminar carpeta?',
        description: 'Se borrara la carpeta seleccionada',
      })
      .pipe(
        filter((confirm) => confirm),
        switchMap(() => this.archiveService.delete(id))
      )
      .subscribe(() => {
        this.folders.update((values) =>
          values.filter((item) => item._id !== id)
        );
      });
  }

  private saveCache(): void {
    this.cacheService.save('folders', {
      folders: this.folders(),
      term: this.term(),
    });
  }

  private loadCache(): void {
    const cache = this.cacheService.load('folders');
    if (!cache) return this.getData();
    this.folders.set(cache.folders);
    this.term.set(cache.term);
  }
}
