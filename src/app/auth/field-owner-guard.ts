import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth';

export const fieldOwnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const userRole = authService.getUserRole();
  if (userRole !== 'FieldOwner') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
