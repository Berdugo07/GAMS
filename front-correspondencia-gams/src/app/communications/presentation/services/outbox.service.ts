import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import {
  communication,
  CommunicationMapper,
} from '../../../communications/infrastructure';
import { environment } from '../../../../environments/environment';

interface createCommunicationProps {
  attachmentsCount: string;
  communicationId: string;
  internalNumber: string;
  procedureId: string;
  documentId?: string;
  reference: string;
  recipients: recipient[];
}

interface recipient {
  accountId: string;
  isOriginal: boolean;
}

interface filterParams {
  limit: number;
  offset: number;
  term?: string;
}

type communicationMode = 'initiate' | 'forward' | 'resend';
@Injectable({
  providedIn: 'root',
})
export class OutboxService {
  private readonly url = `${environment.base_url}/outbox`;
  constructor(private http: HttpClient) {}

  findAll({ limit, offset, term }: filterParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ communications: communication[]; length: number }>(this.url, {
        params,
      })
      .pipe(
        map(({ communications, length }) => ({
          communications: communications.map((item) =>
            CommunicationMapper.fromResponse(item)
          ),
          length,
        }))
      );
  }

  cancel(selectedIds: string[]) {
    return this.http
      .delete<{
        restoredItems: { restoredType: string; code: string }[];
        canceledIds: string[];
      }>(this.url, {
        body: { ids: selectedIds },
      })
      .pipe(
        map(({ canceledIds, restoredItems }) => ({
          canceledIds,
          restoredItems: restoredItems.map(({ restoredType, code }) => ({
            restoredType:
              restoredType === 'inbox'
                ? 'Bandeja de Entrada'
                : 'Administración de Trámites',
            code,
          })),
        }))
      );
  }

  create(data: createCommunicationProps, mode: communicationMode) {
    return this.http
      .post<communication[]>(`${this.url}/${mode}`, data)
      .pipe(
        map((resp) =>
          resp.map((item) => CommunicationMapper.fromResponse(item))
        )
      );
  }
}
