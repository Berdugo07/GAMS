import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { jwtPayload, menu, validResource } from '../../infrastructure';
import { skipUploadIndicator } from '../../../helpers';

interface loginProps {
  login: string;
  password: string;
  remember: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly base_url: string = environment.base_url;
  private _user = signal<jwtPayload | null>(null);
  private _menu = signal<menu[]>([]);
  private _permissions = signal<Record<validResource, string[]> | null>(null);
  private _updatedPassword = signal<boolean>(false);

  public user = computed(() => this._user());
  public menu = computed(() => this._menu());
  public permissions = computed(() => this._permissions()!);
  public updatedPassword = computed(() => this._updatedPassword());

  constructor(private http: HttpClient) {}

  login({ login, password, remember }: loginProps) {
    if (remember) {
      localStorage.setItem('login', login);
    } else {
      localStorage.removeItem('login');
    }
    return this.http
      .post<{ token: string }>(
        `${this.base_url}/auth`,
        {
          login,
          password,
        },
        { context: skipUploadIndicator() }
      )
      .pipe(map(({ token }) => this.setAuthentication(token)));
  }

  logout() {
    localStorage.removeItem('token');
    this._user.set(null);
    this._permissions.set(null);
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }
    return this.http
      .get<{
        token: string;
        menu: menu[];
        permissions: Record<validResource, string[]>;
        updatedPassword: boolean;
      }>(`${this.base_url}/auth`)
      .pipe(
        map(({ menu, token, permissions, updatedPassword }) => {
          this._menu.set(menu);
          this._permissions.set(permissions);
          this._updatedPassword.set(updatedPassword);
          return this.setAuthentication(token);
        }),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }

  updateMyUser(password: string) {
    return this.http
      .put<{ message: string }>(`${this.base_url}/auth`, {
        password,
      })
      .pipe(tap(() => this._updatedPassword.set(true)));
  }

  hasPermission(resource: validResource, action: string[] | string): boolean {
    const entry = this._permissions() ? this._permissions()![resource] : null;
    if (!entry) return false;
    const actions = Array.isArray(action) ? action : [action];
    return actions.some((action) => entry.includes(action));
  }

  private setAuthentication(token: string): boolean {
    this._user.set(jwtDecode(token));
    localStorage.setItem('token', token);
    return true;
  }
}
