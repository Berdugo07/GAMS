import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExternalProcedure } from '../../../../procedures/domain';

@Component({
  selector: 'external-communication',
  imports: [CommonModule],
  template: `
    <div class="py-4 sm:px-8">
      <div class="px-2 sm:px-0">
        <h3 class="text-base font-semibold leading-7">
          {{ procedure().type }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          {{ procedure().reference }}
        </p>
      </div>
      <div class="mt-6">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6">ALTERNO:</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              {{ procedure().code }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6">ESTADO:</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              {{ procedure().state }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6">CITE:</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              {{ procedure().citeCode }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6">CANT. HOJAS / ANEXOS:</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              {{ procedure().numberOfDocuments }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6">CREACION:</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              {{ procedure().createdAt | date : 'short' }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium">SOLICITANTE:</dt>
            <dd class="mt-2 text-sm sm:mt-0">
              <div class="flex flex-col gap-y-1">
                @if (procedure().applicant.type==="NATURAL") {
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Nombre:</dt>
                  <dd class="text-sm sm:mt-0">
                    {{ procedure().fullnameApplicant| titlecase }}
                  </dd>
                </div>
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">CI:</dt>
                  <dd class="text-sm sm:mt-0">
                    {{ procedure().applicant.dni }}
                  </dd>
                </div>
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Telefono:</dt>
                  <dd class="text-sm sm:mt-0">
                    {{ procedure().applicant.phone }}
                  </dd>
                </div>
                } @else {
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Nombre:</dt>
                  <dd class="text-sm sm:mt-0">
                    {{ procedure().fullnameApplicant }}
                  </dd>
                </div>
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Telefono:</dt>
                  <dd class="text-sm sm:mt-0">
                    {{ procedure().applicant.phone }}
                  </dd>
                </div>
                }
              </div>
            </dd>
          </div>
        </dl>
      </div>
      <div class="mt-6 px-4 sm:px-0">
        <p class="font-medium">Requisistos presentados</p>
        <ul class="list-disc px-4 mt-2">
          @for (item of procedure().requirements; track $index) {
          <li>{{ item }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalCommunicationComponent {
  procedure = input.required<ExternalProcedure>();
}
