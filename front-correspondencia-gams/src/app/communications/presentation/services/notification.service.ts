import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationHistory {
  procedureCode: string;
  observation: string;
  status: string;
  applicantName?: string;
  createdAt: string | Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getHistory(
    procedureCode: string,
    page = 1,
    limit = 4,
    date?: string 
  ): Observable<{ items: NotificationHistory[], total: number, page: number, limit: number }> {
    let url = `http://localhost:3000/api/notifications/history/${procedureCode}?page=${page}&limit=${limit}`;
    if (date) {
      url += `&date=${date}`; // 🔹 agregamos el filtro por fecha si existe
    }
    return this.http.get<{ items: NotificationHistory[], total: number, page: number, limit: number }>(url);
  }
}
