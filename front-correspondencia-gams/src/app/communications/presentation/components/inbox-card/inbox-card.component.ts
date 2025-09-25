import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { Communication } from '../../../domain';

@Component({
  selector: 'inbox-card',
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card appearance="outlined">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3"
      >
        <div class="flex items-start sm:items-center gap-4 flex-1">
          <img
            src="images/icons/account.png"
            alt="Avatar"
            class="w-10 h-10 rounded-full object-cover"
          />

          <div class="flex flex-col">
            <span class="font-semibold tracking-wide">
              {{ data().sender.fullname | titlecase }}
            </span>
            <span class="text-sm">
              {{ data().sender.jobtitle }}
            </span>
          </div>
        </div>

        <div class="sm:text-right whitespace-nowrap">
          {{ data().sentDate | date : "d 'de' MMMM 'de' y HH:mm" }}
        </div>
      </div>

      <div class="flow-root p-4 mb-2">
        <dl class="-my-3 divide-y divide-gray-200 text-sm">
          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-4 sm:gap-4">
            <dt class="font-medium">Para:</dt>
            <dd class="sm:col-span-3">
              {{ data().recipient.fullname | titlecase }}
            </dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-4 sm:gap-4">
            <dt class="font-medium">Instruccion / Proveeido:</dt>
            <dd class="sm:col-span-3">
              {{ data().reference }}
            </dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-4 sm:gap-4">
            <dt class="font-medium">Tipo de documento:</dt>
            <dd class="sm:col-span-3">
              {{ data().documentLabel }} - {{ data().groupLabel }}
            </dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-4 sm:gap-4">
            <dt class="font-medium">Cantidad de hojas / anexos:</dt>
            <dd class="sm:col-span-3">{{ data().attachmentsCount }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-4 sm:gap-4">
            <dt class="font-medium">Fecha de recepcion:</dt>
            <dd class="sm:col-span-3">
              @if(data().status==="received"){
              {{ data().receivedDate |date:'short'}}
              } @else {
              <span class="text-red-500 font-medium">
                Usted aun no ha recibido este tramite.
              </span>
              }
            </dd>
          </div>
        </dl>
      </div>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxCardComponent {
  data = input.required<Communication>();
}
