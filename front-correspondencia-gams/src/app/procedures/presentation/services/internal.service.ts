import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { account, AccountMapper } from '../../../administration/infrastructure';
import { internal, InternalMapper } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class InternalService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/internal`;

  create(form: Object) {
    return this.http
      .post<internal>(`${this.URL}`, form)
      .pipe(map((response) => InternalMapper.fromResponse(response)));
  }

  update(id: string, form: Object) {
    return this.http
      .patch<internal>(`${this.URL}/${id}`, form)
      .pipe(map((response) => InternalMapper.fromResponse(response)));
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ procedures: internal[]; length: number }>(`${this.URL}`, {
        params,
      })
      .pipe(
        map(({ procedures, length }) => ({
          procedures: procedures.map((el) => InternalMapper.fromResponse(el)),
          length,
        }))
      );
  }

  searchAccounts(text: string) {
    return this.http
      .get<account[]>(`${this.URL}/participant/${text}`)
      .pipe(map((resp) => resp.map((el) => AccountMapper.fromResponse(el))));
  }
}
