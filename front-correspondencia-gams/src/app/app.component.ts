import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';

import { ThemeService } from './layout/presentation/services';

@Component({
  selector: 'app-root',
  imports: [RouterModule, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'seg-tramites-front';
  themeService = inject(ThemeService);
}
