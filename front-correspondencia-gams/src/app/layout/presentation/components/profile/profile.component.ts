import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../../auth/presentation/services/auth.service';

@Component({
  selector: 'profile',
  imports: [CommonModule, MatListModule, MatIconModule],
  template: `
    <div class="p-2">
      <div class="flex flex-col gap-y-2 items-center pb-4">
        <img
          class="h-auto rounded-full w-14"
          src="images/icons/account.png"
          alt="User image"
        />
        <span class="text-lg font-bold leading-8">
          {{ user?.fullname | titlecase }}
        </span>
        <span
          class="rounded-full bg-green-200 py-1 px-2 text-xs font-medium text-green-700"
        >
          Conectado
        </span>
      </div>

      <mat-action-list>
        <button mat-list-item (click)="settings()">
          <mat-icon matListItemIcon>manage_accounts</mat-icon>
          <div matListItemTitle>Configuracciones</div>
        </button>
        <mat-divider />
        <button mat-list-item (click)="logout()">
          <mat-icon matListItemIcon>logout</mat-icon>
          <div matListItemTitle>Cerrar sesion</div>
        </button>
      </mat-action-list>
      <div class="flex justify-end">
        <a routerLink="/home/info" class="text-xs hover:text-indigo-500" (click)="info()">
          Notas de la version
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user();
  isOpen = model.required<boolean>();

  settings() {
    this.isOpen.set(false);
    this.router.navigateByUrl('/home/settings');
  }

  logout() {
    this.isOpen.set(false);
    this.authService.logout();
    this.router.navigateByUrl('login');
  }

  info() {
    this.isOpen.set(false);
    this.router.navigateByUrl('/home/info');
  }
}
