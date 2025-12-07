import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IRegister } from '../Interfaces/iregister';
import { IloginRequest, IloginResponse, IRefreshRequest, IRefreshResponse } from '../Interfaces/ilogin';
import { IConfirmEmail, IForgotPassword, IResetPassword, ISendConfirmationRequest, IAvailabilityCheck } from '../Interfaces/iauth-extended';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly tokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private platformId = inject(PLATFORM_ID);
  
  // Observable to track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Registration
  register(userData: IRegister): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, userData);
  }

  // Login
  login(payload: IloginRequest): Observable<IloginResponse> {
    return this.http.post<IloginResponse>(`${this.apiUrl}/Auth/login`, payload).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.refreshTokenKey, res.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  // Refresh token
  refreshToken(): Observable<IRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const payload: IRefreshRequest = { refreshToken };
    return this.http.post<IRefreshResponse>(`${this.apiUrl}/Auth/refresh`, payload).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.refreshTokenKey, res.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  // Logout with API call
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError((err) => {
        // Clear local data even if API call fails
        this.clearAuthData();
        return throwError(() => err);
      })
    );
  }

  // Clear authentication data
  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      this.isAuthenticatedSubject.next(false);
    }
  }

  // Email verification - send confirmation
  sendEmailConfirmation(data: ISendConfirmationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/EmailVerification/send-confirmation`, data);
  }

  // Email verification - confirm email
  confirmEmail(data: IConfirmEmail): Observable<any> {
    return this.http.post(`${this.apiUrl}/EmailVerification/confirm`, data);
  }

  // Password reset - forgot password
  forgotPassword(data: IForgotPassword): Observable<any> {
    return this.http.post(`${this.apiUrl}/Password/forgot`, data);
  }

  // Password reset - reset password
  resetPassword(data: IResetPassword): Observable<any> {
    return this.http.post(`${this.apiUrl}/Password/reset`, data);
  }

  // Check availability (email, username, phone)
  checkAvailability(params: IAvailabilityCheck): Observable<any> {
    return this.http.get(`${this.apiUrl}/Availability`, { params: params as any });
  }

  // Get access token
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Check authentication status
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return false;
    
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp * 1000 > Date.now();
      return isValid;
    } catch {
      return false;
    }
  }

  // Get user role from token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch {
      return null;
    }
  }

  // Get user ID from token
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
    } catch {
      return null;
    }
  }
}
