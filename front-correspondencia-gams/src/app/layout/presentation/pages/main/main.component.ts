import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/presentation/services/auth.service';

@Component({
  selector: 'app-main',
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-2"
    >
      <img
        alt="Logo"
        src="images/institution/escudo.png"
        class="h-32 sm:h-48 mb-6"
      />
      <h1 class="text-xl sm:text-3xl font-bold tracking-wide">
        ¡Bienvenid&#64; {{ userName ?? 'Usuario' | titlecase }}!
      </h1>
      <p class="text-gray-600 mt-2 italic">
        "Gestiona tus trámites, desde el inicio hasta su conclusión"
      </p>
      <p class="text-xs mt-8">Versión 2.0.0</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainComponent implements OnInit {
  private authService=inject(AuthService)

  userName = this.authService.user()?.fullname.split(' ')[0].toUpperCase();


  ngOnInit(): void {
  }
}
