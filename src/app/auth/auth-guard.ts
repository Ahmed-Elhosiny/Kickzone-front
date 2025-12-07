import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.auth.getToken();
    const isAuth = this.auth.isAuthenticated();
    
    console.log('🛡️  AUTH GUARD CHECK');
    console.log('   Has token:', !!token);
    console.log('   Is authenticated:', isAuth);
    
    if (isAuth && token) {
      console.log('   ✅ Access GRANTED');
      return true;
    }
    
    console.warn('   ❌ Access DENIED - Not logged in');
    console.warn('   ➡️  Redirecting to /login...');
    this.router.navigate(['/login']);
    return false;
  }
}
