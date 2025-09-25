import { animate, style, transition, trigger } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* => slide', [
    style({
      transform: 'translateX(100%) scale(0.9)',
      opacity: 0.5,
      filter: 'blur(4px)',
    }),
    animate(
      '500ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({
        transform: 'translateX(0) scale(1)',
        opacity: 1,
        filter: 'blur(0)',
      })
    ),
  ]),
  transition('slide => *', [
    style({
      transform: 'translateX(-100%) scale(0.9)',
      opacity: 0.5,
      filter: 'blur(4px)',
    }),
    animate(
      '500ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({
        transform: 'translateX(0) scale(1)',
        opacity: 1,
        filter: 'blur(0)',
      })
    ),
  ]),
  transition('* => *', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
]);
