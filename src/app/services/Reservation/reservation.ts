import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { IReservation } from '../../Model/IReservation/ireservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Reservations`;

  // user
  getMyReservations() {
    return this.http.get<IReservation[]>(`${this.apiUrl}/my`);
  }

  // owner
  getReservationsForMyFields() {
    return this.http.get<IReservation[]>(`${this.apiUrl}/owner`);
  }
}

