import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InternalProcedure } from '../../../../procedures/domain';

@Component({
  selector: 'internal-communication',
  imports: [CommonModule],
  template: `
    <div class="p-2 sm:p-6">
      <dl class="-my-3 divide-y divide-gray-100 text-sm">
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">ALTERNO:</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().code }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">ESTADO:</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().state }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">REFERENCIA:</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().reference }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">CITE:</dt>
          <dd class=" sm:col-span-3">{{ procedure().citeCode }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">NUMERO DE DOCUMENTOS:</dt>
          <dd class=" sm:col-span-3">{{ procedure().numberOfDocuments }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">CREACION:</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().createdAt | date : 'short' }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">REMITENTE:</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().sender.fullname | uppercase }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">DESTINATARIO</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().recipient.fullname | uppercase }}
          </dd>
        </div>
      </dl>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalCommunicationComponent {
  procedure = input.required<InternalProcedure>();
}
