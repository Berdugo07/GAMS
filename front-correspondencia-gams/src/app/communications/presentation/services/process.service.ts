import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  external,
  internal,
  procurement,
  ExternalMapper,
  InternalMapper,
  ProcurementMapper,
} from '../../../procedures/infrastructure';

import { procedureGroup } from '../../../procedures/domain';
import { workflow } from '../../infrastructure';

type procedureResponses = internal | external | procurement;
@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private readonly url = `${environment.base_url}/process`;
  private http = inject(HttpClient);
  constructor() {}

  getProcedure(id: string, group: string) {
    return this.http
      .get<procedureResponses>(`${this.url}/detail/${group}/${id}`)
      .pipe(
        map((resp) => {
          switch (resp.group) {
            case procedureGroup.External:
              return ExternalMapper.fromResponse(resp as external);

            case procedureGroup.Internal:
              return InternalMapper.fromResponse(resp as internal);

            case procedureGroup.Procurement:
              return ProcurementMapper.fromResponse(resp as procurement);

            default:
              throw Error('Procedure is not defined');
          }
        })
      );
  }

  getWorkflow(id: string) {
    return this.http.get<workflow[]>(`${this.url}/workflow/${id}`);
  }
}
