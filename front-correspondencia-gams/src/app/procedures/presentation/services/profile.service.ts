import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { account, AccountMapper } from '../../../administration/infrastructure';
import { Account } from '../../../administration/domain';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly url = `${environment.base_url}/assignation`;
  private http = inject(HttpClient);
  private _account = signal<Account | null>(null);
  account = computed(() => this._account());

  checkAccount(): Observable<boolean> {
    return this.http.get<account>(this.url).pipe(
      tap((resp) => this._account.set(AccountMapper.fromResponse(resp))),
      map(() => true),
      catchError(() => of(false))
    );
  }
}
