import {
  HostListener,
  ElementRef,
  DestroyRef,
  Directive,
  OnChanges,
  input,
  inject,
} from '@angular/core';

@Directive({
  selector: '[restoreScroll]',
})
export class RestoreScrollDirective implements OnChanges {
  isLoading = input.required<boolean>(); // Clave única para identificar el estado del scroll
  scrollKey = input.required<string>();
  private observer: MutationObserver;
  private scrollPosition = 0;
  private destroyRef = inject(DestroyRef).onDestroy(() => {
    sessionStorage.setItem(this.scrollKey(), this.scrollPosition.toString());
    this.observer.disconnect();
  });

  constructor(private el: ElementRef) {
    this.observer = new MutationObserver(() => {
      this.restoreScroll();
    });
  }

  ngOnChanges(): void {
    if (!this.isLoading()) {
      this.observer.observe(this.el.nativeElement, {
        childList: true,
        subtree: true,
      });
    } else {
      this.observer.disconnect(); // Detener la observación mientras se carga
    }
  }

  @HostListener('scroll')
  onScroll(): void {
    this.scrollPosition = this.el.nativeElement.scrollTop;
  }

  private restoreScroll(): void {
    const savedPosition = sessionStorage.getItem(this.scrollKey());
    if (savedPosition && !this.isLoading()) {
      this.el.nativeElement.scrollTo({
        top: parseInt(savedPosition),
        behavior: 'auto',
      });
      this.observer.disconnect(); // Dejar de observar una vez que el scroll se restablece
    }
  }
}
