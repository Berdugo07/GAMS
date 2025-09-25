import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { typeProcedure } from '../../../administration/infrastructure';
import { external, ExternalMapper } from '../../infrastructure';

interface manageExternalProps {
  formProcedure: Object;
  formApplicant: Object;
  formRepresentative: Object;
  requirements?: string[];
}
@Injectable({
  providedIn: 'root',
})
export class ExternalService {
  private readonly URL = `${environment.base_url}/external`;

  constructor(private http: HttpClient) {}

  getSegments() {
    return this.http
      .get<string[]>(`${this.URL}/segments`)
      .pipe(map((resp) => resp.map((item) => ({ value: item, label: item }))));
  }

  getTypesProceduresBySegment(segment: string) {
    return this.http.get<typeProcedure[]>(
      `${this.URL}/types-procedures/${segment}`
    );
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ procedures: external[]; length: number }>(`${this.URL}`, {
        params,
      })
      .pipe(
        map(({ procedures, length }) => ({
          procedures: procedures.map((item) =>
            ExternalMapper.fromResponse(item)
          ),
          length,
        }))
      );
  }

  create({
    formApplicant,
    formProcedure,
    formRepresentative,
    requirements,
  }: manageExternalProps) {
    return this.http
      .post<external>(
        `${this.URL}`,
        {
          ...formProcedure,
          requirements,
          applicant: formApplicant,
          representative:
            Object.keys(formRepresentative).length > 0
              ? formRepresentative
              : null,
        },
      )
      .pipe(map((response) => ExternalMapper.fromResponse(response)));
  }

  update(
    id: string,
    { formProcedure, formApplicant, formRepresentative }: manageExternalProps
  ) {
    return this.http
      .patch<external>(
        `${this.URL}/${id}`,
        {
          ...formProcedure,
          applicant: formApplicant,
          representative:
            Object.keys(formRepresentative).length > 0
              ? formRepresentative
              : null,
        },
      )
      .pipe(map((response) => ExternalMapper.fromResponse(response)));
  }
}
