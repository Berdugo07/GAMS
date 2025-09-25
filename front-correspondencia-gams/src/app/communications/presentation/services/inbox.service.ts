import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { communication, CommunicationMapper } from '../../infrastructure';
import { sendStatus, onlineAccount, recipient } from '../../domain';
import {
  account,
  dependency,
  institution,
} from '../../../administration/infrastructure';

interface createCommunicationProps {
  form: Object;
  recipients: recipient[];
  procedureId: string;
  communicationId?: string;
}

interface filterOutboxProps {
  limit: number;
  offset: number;
  term?: string;
}

interface filterInboxProps {
  limit: number;
  offset: number;
  term?: string;
  isOriginal?: boolean | null;
  group?: string | null;
  status?: sendStatus | null;
}
interface bulkActionResponse {
  date: string;
  ids: string[];
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class InboxService {
  private readonly url = `${environment.base_url}/inbox`;
  private http = inject(HttpClient);

  constructor() {}

  getInstitucions() {
    return this.http
      .get<institution[]>(`${this.url}/institutions`)
      .pipe(
        map((resp) => resp.map((el) => ({ value: el._id, label: el.nombre })))
      );
  }

  getDependenciesInInstitution(id_institution: string) {
    return this.http
      .get<dependency[]>(`${this.url}/dependencies/${id_institution}`)
      .pipe(
        map((resp) => resp.map((el) => ({ value: el._id, label: el.nombre })))
      );
  }

  searchRecipientsAccounts(term: string): Observable<onlineAccount[]> {
    return this.http.get<account[]>(`${this.url}/recipients/${term}`).pipe(
      map((resp) =>
        resp.map(({ _id, user, officer, jobtitle }) => ({
          id: _id,
          userId: user._id,
          fullname: `${officer?.nombre} ${officer?.paterno} ${officer?.materno}`,
          online: false,
          jobtitle,
        }))
      )
    );
  }

  getInbox({ limit, offset, term, isOriginal, ...props }: filterInboxProps) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(typeof isOriginal === 'boolean' && { isOriginal }),
        ...Object.fromEntries(Object.entries(props).filter(([_, v]) => v)),
      },
    });
    return this.http
      .get<{ communications: communication[]; length: number }>(
        `${this.url}/inbox`,
        { params }
      )
      .pipe(
        map(({ communications, length }) => ({
          communications: communications.map((el) =>
            CommunicationMapper.fromResponse(el)
          ),
          length,
        }))
      );
  }

  getOne(id: string) {
    return this.http
      .get<communication>(`${this.url}/${id}`)
      .pipe(map((resp) => CommunicationMapper.fromResponse(resp)));
  }

  accept(ids: string[]) {
    return this.http
      .put<bulkActionResponse>(`${this.url}/accept`, { ids })
      .pipe(
        map(({ ids, date }) => ({ ids, receivedDate: new Date(date) }))
      );
  }

  reject(ids: string[], description: string) {
    // return this.http.put<bulkActionResponse>(`${this.url}/reject`, {
    //   description,
    //   ids,
    // });
  }
}
