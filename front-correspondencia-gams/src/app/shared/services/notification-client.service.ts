import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationClientService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = 'http://localhost:3000/api'; 

  checkMessageStatus(messageId: string) {
    return this.http.get(`${this.apiUrl}/notifications/status/${messageId}`).pipe(
      catchError(error => {
        this.toastService.showToast({
          title: 'Error',
          description: 'No se pudo verificar el estado del mensaje',
          severity: 'error'
        });
        return of(null);
      })
    );
  }

  sendProcedureNotification(procedureId: string) {
    return this.http.post(`${this.apiUrl}/notifications/${procedureId}`, {}).pipe(
      catchError(error => {
        return of({ error: true, details: error });
      })
    );
  }

  /**
   * Notificación múltiple con observación
   */
  notify(ids: string[], observation: string) {
    return this.http.post(`${this.apiUrl}/notifications/send-observation`, { ids, observation }).pipe(
      catchError(error => {
        this.toastService.showToast({
          title: 'Error',
          description: 'No se pudo enviar la notificación',
          severity: 'error'
        });
        return of(null);
      })
    );
  }
}
