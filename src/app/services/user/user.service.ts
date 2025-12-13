import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUserProfile } from '../../iuser';
import { 
  IPatchProfile, 
  IChangePassword, 
  IChangeUsername, 
  IRequestEmailChange, 
  IConfirmEmailChange 
} from '../../Interfaces/iauth-extended';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Get current user profile
  getCurrentUser(): Observable<IUserProfile> {
    return this.http.get<IUserProfile>(`${this.apiUrl}/User/me`);
  }

  // Update user profile (name, location, phoneNumber)
  updateProfile(data: IPatchProfile): Observable<any> {
    return this.http.patch(`${this.apiUrl}/User/profile`, data);
  }

  // Change password
  changePassword(data: IChangePassword): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/change-password`, data);
  }

  // Change username
  changeUsername(data: IChangeUsername): Observable<any> {
    return this.http.patch(`${this.apiUrl}/User/username`, data);
  }

  // Request email change
  requestEmailChange(data: IRequestEmailChange): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/request-email-change`, data);
  }

  // Confirm email change
  confirmEmailChange(data: IConfirmEmailChange): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/confirm-email-change`, data);
  }
}
