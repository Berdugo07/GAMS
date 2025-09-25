import { Location } from '@angular/common';
import { Directive, HostListener, inject } from '@angular/core';
import { CacheService } from '../services/cache.service';

@Directive({
  selector: '[backButton]',
  standalone: true,
})
export class BackButtonDirective {
  private localtion = inject(Location);
  private cacheService = inject(CacheService);

  @HostListener('click')
  onClick() {
    this.cacheService.keepAlive.set(true);
    this.localtion.back();
  }
}
