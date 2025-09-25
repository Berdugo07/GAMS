import { Injectable, signal } from '@angular/core';
import { toast } from 'ngx-sonner';

interface ToastConfig {
  title: string;
  description?: string;
  severity?: 'warning' | 'info' | 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  protected readonly toast = toast;

  customToastData = signal<string | null>(null);

  showToast({ title, description, severity }: ToastConfig) {
    const duration = 5000;
    switch (severity) {
      case 'warning':
        toast.warning(title, { description, closeButton: true });
        break;

      case 'error':
        toast.error(title, { description, closeButton: true });
        break;

      case 'success':
        toast.success(title, { description, closeButton: true });
        break;

      case 'info':
        toast.info(title, { description, closeButton: true });
        break;

      default:
        toast(title, { description, closeButton: true });
        break;
    }
  }
}
