import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InternalProcedure } from '../../../domain';

@Component({
  selector: 'internal-description',
  imports: [CommonModule],
  template: `
    <div class="p-2 sm:p-6">
      <dl class="-my-3 divide-y divide-gray-200 text-sm">
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Codigo</dt>
          <dd class="sm:col-span-3">
            {{ data().code }}
          </dd>
        </div>

         <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Estado</dt>
          <dd class="sm:col-span-3">
            {{ data().state }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Referencia</dt>
          <dd class="sm:col-span-3">
            {{ data().reference }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Cite</dt>
          <dd class="sm:col-span-3">{{ data().citeCode }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Numero de documentos</dt>
          <dd class="sm:col-span-3">{{ data().numberOfDocuments }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Fecha creacion</dt>
          <dd class="sm:col-span-3">
            {{ data().createdAt | date : 'short' }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Fecha de conclusion</dt>
          <dd class="sm:col-span-3">
            {{
              data().completedAt ? (data().completedAt | date : 'short') : '----'
            }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Remitente</dt>
          <dd class="sm:col-span-3">
            {{ data().sender.fullname | uppercase }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Destinatario</dt>
          <dd class="sm:col-span-3">
            {{ data().recipient.fullname | uppercase }}
          </dd>
        </div>
      </dl>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalDescriptionComponent {
  data = input.required<InternalProcedure>();
}
