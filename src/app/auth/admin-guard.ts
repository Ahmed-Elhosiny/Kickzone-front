import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const role = this.auth.getUserRole();

    if (role === 'Admin') {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}

