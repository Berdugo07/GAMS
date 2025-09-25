import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { folder } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private readonly url = `${environment.base_url}/folders`;
  private http = inject(HttpClient);
  constructor() {}

  create(name: string) {
    return this.http.post<folder>(this.url, { name });
  }

  getFolders() {
    return this.http.get<folder[]>(this.url);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
