import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const isNotAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (localStorage.getItem('token')) {
    router.navigateByUrl('/home');
    return false;
  }
  return true;
};
