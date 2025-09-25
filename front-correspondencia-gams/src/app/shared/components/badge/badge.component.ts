import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

type severity =
  | 'success'
  | 'danger'
  | 'info'
  | 'warning'
  | 'purple'
  | 'indigo'
  | 'pink';

@Component({
  selector: 'badge',
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center rounded-md text-sm/2 px-2 py-1 font-medium ring-1 ring-inset"
      [ngClass]="severityClass()"
    >
      {{ message() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  message = input.required<string>();
  severity = input<severity>('info');

  severityClass = computed<string>(() => {
    switch (this.severity()) {
      case 'success':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'danger':
        return 'bg-red-50 text-red-700 ring-red-600/10';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'info':
        return 'bg-blue-50 text-blue-700 ring-blue-700/10';
      case 'purple':
        return 'bg-purple-50 text-purple-700 ring-purple-700/10';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-700/10';
      case 'pink':
        return 'bg-pink-50 text-pink-700 ring-pink-700/10';
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  });
}
