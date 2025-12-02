import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IRegister } from '../Interfaces/iregister';
import { IloginRequest, IloginResponse } from '../Interfaces/ilogin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //URLs for authentication
  private regUrl = 'https://localhost:7263/api/Auth/register';
  private loginUrl = 'https://localhost:7263/api/Auth/login';

  private readonly tokenKey = 'access_token';
  constructor(private http: HttpClient) {}
  //registration method
  register(userData: IRegister): Observable<any> {
    return this.http.post(this.regUrl, userData);
  }

  //login method
  login(payload: IloginRequest): Observable<IloginResponse> {
    return this.http.post<IloginResponse>(`${this.loginUrl}/login`, payload).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
        if (res?.refreshToken) {
          localStorage.setItem('refresh_token', res.refreshToken);
        }
      }),
      catchError(err => {

        return throwError(() => err);
      })
    );
  }


  //logout method
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('refresh_token');
  }

  //get token method
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
//authentication status
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

