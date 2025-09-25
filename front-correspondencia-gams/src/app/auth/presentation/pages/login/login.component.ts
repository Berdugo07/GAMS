import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="p-4 absolute top-0 left-0">
      <img src="images/logos/gams.png" class="h-16 sm:h-24" />
    </div>
    <div class="h-screen flex items-center justify-center w-full main">
      <div class="rounded-xl px-6 py-8 w-11/12 sm:w-[450px] box">
        <div class="sm:mx-auto mb-6">
          <img
            class="mx-auto h-16 mb-4"
            src="images/icons/app.png"
            alt="Icon app"
          />
          <p class="text-center text-xl font-bold font-sans">
            Sistema de Seguimiento de Trámites
          </p>
          <p class="text-center">Inicio de sesion</p>
        </div>

        <form [formGroup]="loginForm" (submit)="login()" autocomplete="off">
          <div class="mb-2">
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                placeholder="Ingrese su usuario"
                formControlName="login"
              />
            </mat-form-field>
          </div>
          <div class="mb-2">
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                [autocomplete]="false"
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                placeholder="Ingrese su contraseña"
                formControlName="password"
              />
              <!-- <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>
                  {{ hidePassword ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button> -->
            </mat-form-field>
          </div>
          <div class="mb-4">
            <mat-checkbox formControlName="remember">
              Recordar Usuario
            </mat-checkbox>
          </div>
          <button
            type="submit"
            matButton="filled"
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full"
          >
            @if(isLoading()){ 
              <mat-spinner [diameter]="25" [strokeWidth]="3" />
            }
            @else {
              Ingresar
            } 
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
  .main {
    background-color:var(--mat-sys-surface-container);
  }
  .box {
    box-shadow: var(--mat-sys-level2);
    background-color: var(--mat-sys-surface);
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  hidePassword = true;
  loginForm: FormGroup = this.fb.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false],
  });
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const loginSaved = localStorage.getItem('login');
    if (!loginSaved) return;
    this.loginForm.patchValue({ login: loginSaved, remember: true });
  }

  login() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.authService
      .login(this.loginForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(() => {
        this.router.navigateByUrl('/home');
      });
  }
}
