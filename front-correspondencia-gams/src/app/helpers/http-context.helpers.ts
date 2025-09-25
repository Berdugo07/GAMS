import { HttpContext } from '@angular/common/http';
import { SHOW_PROGRESS_BAR, SHOW_UPLOAD_DIALOG } from '../core/interceptors/loading-context.token';


export function skipLoadIndicator() {
  return new HttpContext().set(SHOW_PROGRESS_BAR, false);
}

export function skipUploadIndicator() {
  return new HttpContext().set(SHOW_UPLOAD_DIALOG, false);
}
