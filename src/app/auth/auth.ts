import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../iuser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7263/api/Auth/register';

  constructor(private http: HttpClient) {}

  register(userData: IUser): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}

