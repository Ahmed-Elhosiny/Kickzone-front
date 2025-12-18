import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';


export const AdminGuard: CanActivateFn = ( _ , state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const role = auth.getUserRole();

  if (role !== 'Admin') {
    router.navigate(['/home']);
    return false;
  }

  return true;
  }


