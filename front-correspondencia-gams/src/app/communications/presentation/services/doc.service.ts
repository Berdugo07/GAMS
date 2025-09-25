import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { account, AccountMapper } from '../../../administration/infrastructure';
import { doc, DocMapper } from '../../infrastructure';

interface filterParams {
  limit: number;
  offset: number;
  term?: string;
  type?: string;
  ownDocs?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class DocService {
  private readonly url = `${environment.base_url}/documents`;
  private http = inject(HttpClient);

  constructor() {}

  searchAccounts(term: string) {
    const params = new HttpParams({ fromObject: { term } });
    return this.http
      .get<account[]>(`${this.url}/accounts`, { params })
      .pipe(map((resp) => resp.map((el) => AccountMapper.fromResponse(el))));
  }

  findAll({ limit, offset, ...props }: filterParams) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...Object.fromEntries(Object.entries(props).filter(([_, v]) => v)),
      },
    });
    return this.http
      .get<{ documents: doc[]; length: number }>(this.url, { params })
      .pipe(
        map(({ documents, length }) => ({
          documents: documents.map((el) => DocMapper.fromResponse(el)),
          length,
        }))
      );
  }

  create(form: Object) {
    return this.http
      .post<doc>(this.url, form)
      .pipe(map((resp) => DocMapper.fromResponse(resp)));
  }

  update(id: string, form: Object) {
    return this.http
      .patch<doc>(`${this.url}/${id}`, form)
      .pipe(map((resp) => DocMapper.fromResponse(resp)));
  }

  searchPendingDocs(term?: string) {
    const params = new HttpParams({ fromObject: { ...(term && { term }) } });
    return this.http.get<doc[]>(`${this.url}/pending`, { params });
  }
}
