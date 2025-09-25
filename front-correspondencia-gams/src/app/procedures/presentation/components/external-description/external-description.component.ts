import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExternalProcedure } from '../../../domain';

@Component({
  selector: 'external-description',
  imports: [CommonModule],
  template: `
    <div class="p-3 sm:p-4">
      <dl class="-my-3 divide-y divide-gray-100 text-sm">
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Codigo</dt>
          <dd class="sm:col-span-3">{{ data().code }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Estado</dt>
          <dd class="sm:col-span-3">
            {{ data().state }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Cite</dt>
          <dd class="sm:col-span-3">
            {{ data().citeCode }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Referencia</dt>
          <dd class="sm:col-span-3">
            {{ data().reference }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Tipo de tramite</dt>
          <dd class="sm:col-span-3">{{ data().type }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Cantidad de hojas</dt>
          <dd class="sm:col-span-3">
            {{ data().numberOfDocuments }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Solicitante</dt>
          <dd class="sm:col-span-3">
            <div class="flex">
              <div class="w-32 font-medium">Nombre:</div>
              <div class="w-full">
                {{ data().fullnameApplicant }}
              </div>
            </div>
            @if(data().applicant.dni){
            <div class="flex">
              <div class="w-32 font-medium">CI:</div>
              <div class="w-full">
                {{ data().applicant.dni }}
              </div>
            </div>
            }
            <div class="flex">
              <div class="w-32 font-medium">Telefono:</div>
              <div class="w-full">
                {{ data().applicant.phone }}
              </div>
            </div>
          </dd>
        </div>

        @if(data().representative){
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Representante</dt>
          <dd class="sm:col-span-3">
            <div class="flex">
              <div class="w-32 font-medium">Nombre</div>
              <div class="w-full">
                {{ data().fullnameRepresentative }}
              </div>
            </div>
            <div class="flex">
              <div class="w-32 font-medium">CI</div>
              <div class="w-full">
                {{ data().representative?.dni }}
              </div>
            </div>
            <div class="flex">
              <div class="w-32 font-medium">Telefono</div>
              <div class="w-full">
                {{ data().representative?.phone }}
              </div>
            </div>
          </dd>
        </div>
        }

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium">Fecha de creacion</dt>
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
      </dl>

      <div class="mt-8 font-medium text-sm">Requerimientos presentados</div>
      <ol class="mt-4 space-y-4 text-justify text-sm">
        @for (item of data().requirements; track $index) {
        <li class="flex items-center space-x-3 rtl:space-x-reverse">
          <svg
            class="shrink-0 w-3.5 h-3.5 text-green-500"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 16 12"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M1 5.917 5.724 10.5 15 1.5"
            />
          </svg>
          <span>{{ item }}</span>
        </li>
        } @empty {
        <li>Sin requerimientos</li>
        }
      </ol>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalDescriptionComponent {
  data = input.required<ExternalProcedure>();
}
