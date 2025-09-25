import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { archive } from '../../infrastructure/interfaces/archive.interface';
import { map } from 'rxjs';
import { ArchiveMapper } from '../../infrastructure';

interface createArchiveProps {
  description: string;
  folderId?: string;
  ids: string[];
  state: string;
}

interface findProps {
  folderId: string | null;
  term: string;
  limit: number;
  offset: number;
}
@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private readonly url = `${environment.base_url}/archives`;
  private http = inject(HttpClient);
  constructor() {}

  create(form: createArchiveProps) {
    return this.http.post<{ message: string; itemIds: string[] }>(
      this.url,
      form
    );
  }

  findAll({ folderId, term, limit, offset }: findProps) {
    const params = new HttpParams({
      fromObject: {
        ...(folderId && { folder: folderId }),
        ...(term && { term }),
        limit,
        offset,
      },
    });
    return this.http
      .get<{
        archives: archive[];
        length: number;
        folderName: string;
      }>(this.url, {
        params,
      })
      .pipe(
        map(({ archives, length, folderName }) => ({
          length,
          folderName,
          archives: archives.map((el) => ArchiveMapper.fromResponse(el)),
        }))
      );
  }

  unarchive(id: string) {
    return this.http.delete<{ message: string; id: string }>(
      `${this.url}/${id}`
    );
  }
}
