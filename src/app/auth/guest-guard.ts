import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const token = this.auth.getToken();
    const isAuth = this.auth.isAuthenticated();
    
    console.log('🔓 GUEST GUARD CHECK');
    console.log('   Has token:', !!token);
    console.log('   Is authenticated:', isAuth);
    
    if (isAuth && token) {
      console.warn('   ⚠️  Already logged in - Redirecting to /home...');
      this.router.navigate(['/home']);
      return false;
    }
    
    console.log('   ✅ Access GRANTED - Not logged in');
    return true;
  }
}
