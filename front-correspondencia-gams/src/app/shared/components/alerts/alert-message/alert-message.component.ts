import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { timer } from 'rxjs';

@Component({
  selector: 'alert-message',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    @if(visible()){
    <div
      [@alertFadeSlide]
      class="px-4 py-2 rounded-md border"
      [ngClass]="{
        'text-green-900 bg-green-100 border-green-200': severity() === 'success',
        'text-yellow-900 bg-yellow-100 border-yellow-200': severity() === 'warning',
        'text-red-900 bg-red-100 border-red-200': severity() === 'error',
        'text-blue-900 bg-blue-100 border-blue-200': severity() === 'info'
      }"
    >
      <div class="flex justify-between items-center">
        <div class="flex-1 flex">
          <div class="mr-4">
            @switch (severity()) {
              @case ('warning') {
                <mat-icon fontIcon="warning"/>
              }
              @case ('success') {
                <mat-icon fontIcon="check_circle"/>
              }
              @case ('error') {
                <mat-icon fontIcon="dangerous"/>
              }
              @default {
                 <mat-icon fontIcon="info"/>
              }
            }
          </div>
          <div>
            <h4 class="text-md leading-6 font-medium">
              {{ title() }}
            </h4>
            @if(message()){
            <p class="text-sm">
             {{message()}}
            </p>
            }
          </div>
        </div>
        @if(closable()){
          <div>
            <button matIconButton (click)="close()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('alertFadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '180ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '180ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class AlertMessageComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  severity = input.required<'success' | 'warning' | 'error' | 'info'>();
  title = input.required<string>();
  message = input<string>('');

  life = input<number>();
  closable = input(false);
  onClose = output<void>();

  // * For show leave animation
  visible = signal(true);

  ngOnInit(): void {
    if (this.life()) {
      timer(this.life()!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.close());
    }
  }

  close() {
    this.visible.set(false);
    setTimeout(() => this.onClose.emit(), 180);
  }
}
