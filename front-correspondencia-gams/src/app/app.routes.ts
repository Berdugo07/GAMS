import { Routes } from '@angular/router';

import {
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
} from './auth/presentation/guards';
import { accountGuard } from './administration/presentation/guards/account.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Autentificacion',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () =>
      import('./auth/presentation/pages/login/login.component'),
  },
  {
    path: 'home',
    title: 'Inicio',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('./layout/presentation/pages/home/home.component'),
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
     
      {
        path: 'external',
        data: { animation: 'ExternalPage', resource: 'external' },
        canActivate: [accountGuard],
        loadComponent: () =>
          import(
            './procedures/presentation/pages/externals-manage/externals-manage.component'
          ),
      },
      {
        path: 'internal',
        data: { animation: 'InternalPage', resource: 'internal' },
        canActivate: [accountGuard],
        loadComponent: () =>
          import(
            './procedures/presentation/pages/internals-manage/internals-manage.component'
          ),
      },
      {
        path: 'inbox',
        title: 'Bandeja de entrada',
        data: { animation: 'InboxPage' },
        canActivate: [accountGuard],
        loadComponent: () =>
          import('./communications/presentation/pages/inbox/inbox.component'),
      },
      {
        path: 'inbox/:id',
        title: 'Detalle',
        data: { animation: 'slide' },
        loadComponent: () =>
          import(
            './communications/presentation/pages/inbox-detail/inbox-detail.component'
          ),
      },
      {
        path: 'outbox',
        title: 'Bandeja - Salida',
        data: { animation: 'OutboxPage' },
        canActivate: [accountGuard],
        loadComponent: () =>
          import('./communications/presentation/pages/outbox/outbox.component'),
      },
      {
        path: 'folders',
        data: { animation: 'FoldersPage' },
        loadComponent: () =>
          import(
            './communications/presentation/pages/folders/folders.component'
          ),
      },
      {
        path: 'folders/:id',
        data: { animation: 'ArchivePage' },
        loadComponent: () =>
          import(
            './communications/presentation/pages/archives/archives.component'
          ),
      },
      {
        path: ':from/:group/:id',
        title: 'Detalle',
        data: { animation: 'slide' },
        loadComponent: () =>
          import('./procedures/presentation/pages/detail/detail.component'),
      },
      {
        path: 'main',
        loadComponent: () =>
          import('./layout/presentation/pages/main/main.component'),
      },
     
    ],
  },
  { path: '**', redirectTo: 'login' },
];
