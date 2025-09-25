import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';

type fileGroup = 'resource' | 'post';
interface uploadedFile {
  fileName: string;
  originalName: string;
}
@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/files`;

  getFile(url: string) {
    return this.http.get(url, { responseType: 'blob' })
  }

  uploadFile(file: File, group: fileGroup) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<uploadedFile>(`${this.URL}/${group}`, formData);
  }

  downloadFileFromUrl(url: string, originalName: string): void {
    this.getFile(url).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = originalName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }
}
