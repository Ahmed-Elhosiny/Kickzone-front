import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { IGetReservationDto } from '../../Model/IReservation/ireservation-dto';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Reservations`;

  // user
  getMyReservations(userId: number) {
    return this.http.get<IGetReservationDto[]>(
      `${this.apiUrl}/user/${userId}`
    );
  }

  // owner
  getReservationsForMyField(fieldId: number|null) {
    return this.http.get<IGetReservationDto[]>(`${this.apiUrl}/field/${fieldId}`);
  }
}

