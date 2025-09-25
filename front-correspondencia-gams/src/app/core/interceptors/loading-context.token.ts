import { HttpContextToken } from '@angular/common/http';

export const SHOW_PROGRESS_BAR = new HttpContextToken<boolean>(() => true);
export const SHOW_UPLOAD_DIALOG = new HttpContextToken<boolean>(() => true);

