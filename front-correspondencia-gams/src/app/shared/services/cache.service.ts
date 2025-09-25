import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CacheService<T> {
  private storage = signal<Record<string, T>>({});
  public keepAlive = signal(false);

  private scrollEvent = new Subject<void>();
  scrollEvent$ = this.scrollEvent.asObservable();

  save(key: string, data: T): void {
    this.storage()[key] = data;
    this.keepAlive.set(false);
  }

  load(key: string): T | undefined {
    return this.storage()[key];
  }

  retoreScroll() {
    this.scrollEvent.next();
  }
}
