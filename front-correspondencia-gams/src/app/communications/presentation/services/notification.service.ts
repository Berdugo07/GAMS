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

export interface ObservationResult {
  id: string;
  success: boolean;
  message: string;
  state?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = 'http://localhost:3000/api/notifications';

  constructor(private http: HttpClient) {}

  getHistory(
    procedureCode: string,
    date?: string
  ): Observable<{ items: NotificationHistory[]; total: number }> {
    let url = `${this.baseUrl}/history/${procedureCode}`;
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    return this.http.get<{ items: NotificationHistory[]; total: number }>(url);
  }

  sendObservation(ids: string[], observation: string): Observable<ObservationResult[]> {
    return this.http.post<ObservationResult[]>(`${this.baseUrl}/send-observation`, {
      ids,
      observation,
    });
  }
}
