import { computed, inject, Injectable, signal, DOCUMENT } from '@angular/core';


export type ThemeBackground = 'light' | 'dark';
export type ThemeColor = 'red' | 'yellow' | 'green' | 'rose' | 'azure';

export type ThemeClass = `${ThemeColor}-${ThemeBackground}`;

export const THEME_CLASSES: ThemeClass[] = [
  'red-light',
  'red-dark',
  'green-light',
  'green-dark',
  'yellow-light',
  'yellow-dark',
  'rose-light',
  'rose-dark',
  'azure-dark',
  'azure-light',
];

export interface ThemeColorOption {
  value: ThemeColor;
  label: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private _currentTheme = signal<ThemeClass>('azure-light');
  currentTheme = computed(() => this._currentTheme());

  constructor() {
    this.setTheme(this.getThemeFromLocalStorage());
  }

  setTheme(theme: ThemeClass) {
    this.document.documentElement.classList.remove(this._currentTheme());
    this.document.documentElement.classList.add(theme);
    this._currentTheme.set(theme);
    localStorage.setItem('preferred-theme', this._currentTheme());
  }

  private getThemeFromLocalStorage(): ThemeClass {
    const theme = localStorage.getItem('preferred-theme');
    const validTheme = THEME_CLASSES.find((validTheme) => validTheme === theme);
    return validTheme ? validTheme : 'azure-light';
  }
}
