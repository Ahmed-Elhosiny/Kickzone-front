import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IRegister } from '../Interfaces/iregister';
import { IloginRequest, IloginResponse } from '../Interfaces/ilogin';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //URLs for authentication
  private regUrl = 'https://localhost:7263/api/Auth/register';
  private loginUrl = 'https://localhost:7263/api/Auth/login';

  private readonly tokenKey = 'access_token';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}
  //registration method
  register(userData: IRegister): Observable<any> {
    return this.http.post(this.regUrl, userData);
  }

  //login method
  login(payload: IloginRequest): Observable<IloginResponse> {
    return this.http.post<IloginResponse>(this.loginUrl, payload).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          if (typeof window !== 'undefined') {
            if (res?.token) {
              localStorage.setItem(this.tokenKey, res.token);
              console.log('Token stored in localStorage:', localStorage.getItem(this.tokenKey));
            }
            if (res?.refreshToken) {
              localStorage.setItem('refresh_token', res.refreshToken);
            }
          }
        }
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  //logout method
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('refresh_token');
    }

    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('refresh_token');
  }

  //get token method
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }
  //authentication status
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = this.getToken();
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  }
}
