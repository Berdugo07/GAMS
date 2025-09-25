import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

import { finalize, forkJoin } from 'rxjs';

import { ProcessService } from '../../../../communications/presentation/services';
import {
  ProcurementProcedure,
  ExternalProcedure,
  InternalProcedure,
  procedureGroup,
  Procedure,
} from '../../../domain';
import {
  ExternalDescriptionComponent,
  InternalDescriptionComponent,
} from '../../components';
import { BackButtonDirective } from '../../../../shared';
import { workflow } from '../../../../communications/infrastructure';


@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    BackButtonDirective,
    ExternalDescriptionComponent,
    InternalDescriptionComponent,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button backButton>
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span class="ml-4">Detalle</span>
    </mat-toolbar>

    @if(isLoding()) {
    <div class="h-[calc(100vh-200px)] flex items-center justify-center w-full">
      <div class="flex flex-col items-center">
        <mat-spinner />
        <p class="text-lg font-normal mt-4">Cargando contenido</p>
      </div>
    </div>
    } @else {
    <div @fadeIn>
      <mat-tab-group
        mat-stretch-tabs="false"
        mat-align-tabs="start"
        dynamicHeight
      >
        <mat-tab label="Descripcion">
          <div class="p-2 sm:p-4">
            @switch (procedure()?.group) { @case (groupEnum.External) {
            <external-description [data]="external" />
            } @case (groupEnum.Internal) {
            <internal-description [data]="internal" />
            } @default {
            <p>Group procedure is not defined</p>
            } }
          </div>
        </mat-tab>
       
      </mat-tab-group>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export default class DetailComponent {
  private processService = inject(ProcessService);

  @Input('id') procedureId: string;
  @Input('group') group: string;

  procedure = signal<Procedure | null>(null);
  workflow = signal<workflow[]>([]);
  isLoding = signal(true);

  public groupEnum = procedureGroup;

  ngOnInit(): void {
    this.getDetail();
  }

  private getDetail() {
    this.getProcedureData()
      .pipe(finalize(() => this.isLoding.set(false)))
      .subscribe(([procedure, workflow]) => {
        this.procedure.set(procedure);
        this.workflow.set(workflow);
      });
  }

  private getProcedureData() {
    return forkJoin([
      this.processService.getProcedure(this.procedureId, this.group),
      this.processService.getWorkflow(this.procedureId),
    ]);
  }

  get external() {
    return this.procedure() as ExternalProcedure;
  }

  get internal() {
    return this.procedure() as InternalProcedure;
  }

  get procurement() {
    return this.procedure() as ProcurementProcedure;
  }
}
