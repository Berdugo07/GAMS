import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import { filter, map, Observable, switchMap } from 'rxjs';
import {
  AlertService,
  selectOption,
  SelectSearchComponent,
} from '../../../../shared';
import { procedureState } from '../../../../procedures/domain';
import { FolderService, ArchiveService } from '../../services';
import { Communication } from '../../../domain';

@Component({
  selector: 'app-archive-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SelectSearchComponent,
  ],
  template: `
    <h2 mat-dialog-title>
      Archivado de {{ data.length > 1 ? 'tramites' : 'tramite' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="archiveForm">
        <div class="flex flex-col gap-y-2">
          <div class="text-md mb-4">
            @if(data.length>1){ Se archivaran un total de
            {{ data.length }} tramites. } @else { El tramite
            {{ data[0].procedure.code }} sera archivado. }
          </div>
          <label>Archivar como:</label>
          <mat-radio-group
            required
            formControlName="state"
            class="flex flex-col p-2"
          >
            @for (option of statusOptions; track $index) {
            <mat-radio-button [value]="option.value">
              {{ option.label }}
            </mat-radio-button>
            }
          </mat-radio-group>
          <div>
            <mat-form-field appearance="outline">
              <mat-label>Descripcion</mat-label>
              <textarea
                matInput
                formControlName="description"
                placeholder="Ingrese el motivo del archivo"
              ></textarea>
            </mat-form-field>
          </div>
          <div>
            <select-search
              [items]="folders()"
              title="Carpeta (Opcional)"
              placeholder="Seleccione una carpeta"
              placeholderLabel="Nombre de la carpeta a buscar"
              (onSelect)="archiveForm.get('folderId')?.setValue($event)"
            />
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" mat-dialog-close>Cancelar</button>
      <button
        mat-button
        color="primary"
        [disabled]="archiveForm.invalid"
        (click)="archive()"
      >
        Archivar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveDialogComponent {
  private dialogRef = inject(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private alertService = inject(AlertService);
  private folderService = inject(FolderService);
  private archiveService = inject(ArchiveService);

  data: Communication[] = inject(MAT_DIALOG_DATA);
  folders = toSignal(this.getFolders(), { initialValue: [] });

  readonly statusOptions = [
    {
      value: procedureState.Concluido,
      label: 'Concluido: Se concluyo correctamente',
    },
    {
      value: procedureState.Anulado,
      label: 'Anulado: Tramite incorrecto',
    },
    {
      value: procedureState.Suspendido,
      label: 'Suspendido: Se continuara en un futuro',
    },
    {
      value: procedureState.Retirado,
      label: 'Retirado: Se retiro la documentacion',
    },
    {
      value: procedureState.Abandono,
      label: 'Abandono: El tramite fue abandonado',
    },
  ];

  archiveForm: FormGroup = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(4)]],
    state: ['', Validators.required],
    folderId: [null],
  });

  archive() {
    const selection = this.data.map(({ id }) => id);
    this.alertService
      .confirmDialog({
        title: `¿Confirmar archivado?`,
        description:
          this.data.length === 1
            ? `El tramite ${this.data[0].procedure.code} pasara a su seccion de archivos`
            : `Los tramites seleccionados pasaran a su seccion de archivos`,
      })
      .pipe(
        filter((confirm) => confirm),
        switchMap(() =>
          this.archiveService.create({
            ...this.archiveForm.value,
            ids: selection,
          })
        )
      )
      .subscribe(({ itemIds }) => {
        this.dialogRef.close(itemIds);
      });
  }

  private getFolders(): Observable<selectOption<string>[]> {
    return this.folderService
      .getFolders()
      .pipe(
        map((resp) =>
          resp.map(({ _id, name }) => ({ value: _id, label: name }))
        )
      );
  }
}
