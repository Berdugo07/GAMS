import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export const overlayAnimation = trigger('overlayAnimation', [
  state('void', style({ opacity: 0, transform: 'scale(0.95)' })), // Estado inicial
  state('*', style({ opacity: 1, transform: 'scale(1)' })), // Estado visible
  transition('void => *', [animate('200ms ease-out')]), // Animación de entrada
  transition('* => void', [animate('150ms ease-in')]), // Animación de salida
]);
