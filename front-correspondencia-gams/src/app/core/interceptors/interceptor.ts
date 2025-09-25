import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';

import { LoadingService, ToastService } from '../../shared';
import { SHOW_PROGRESS_BAR, SHOW_UPLOAD_DIALOG } from './loading-context.token';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);
  const loadingService = inject(LoadingService);

  const load = req.method === 'GET' && req.context.get(SHOW_PROGRESS_BAR);
  const upload = ['POST', 'PUT', 'PATCH'].includes(req.method) && req.context.get(SHOW_UPLOAD_DIALOG);

  if (load) {
    loadingService.toggleLoading(true);
  }

  if (upload) {
    loadingService.toggleUploading(true);
  }

  const reqWithHeader = req.clone({
    headers: req.headers.append(
      'Authorization',
      `Bearer ${localStorage.getItem('token') || ''}`
    ),
  });

  return next(reqWithHeader).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        const message: string =
          typeof error.error['message'] === 'string'
            ? error.error['message']
            : 'No se pudo realizar la solicitud';

        switch (error.status) {
          case 500:
            toastService.showToast({
              severity: 'error',
              title: 'Error interno',
              description:
                'No se pudo procesar la solicitud. Por favor, vuelva a intentarlo más tarde.',
            });
            break;
          case 400:
            toastService.showToast({
              severity: 'warning',
              title: 'Solictud incorrecta',
              description: message,
            });
            break;
          case 403:
            toastService.showToast({
              severity: 'info',
              title: 'Acceso denegado',
              description: 'No tiene permiso para acceder a este recurso.',
            });
            break;
          case 404:
            toastService.showToast({
              severity: 'warning',
              title: 'Solictud incorrecta',
              description: message,
            });
            break;
          default:
            break;
        }
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (load) loadingService.toggleLoading(false);
      if (upload) loadingService.toggleUploading(false);
    })
  );
}
