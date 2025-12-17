import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { IGetReservationDto, IReservationsResponse } from '../../Model/IReservation/ireservation-dto';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Reservations`;


  // user
  getMyReservations(userId: number, page: number=1, pageSize: number=50) {

     const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<IReservationsResponse>(
      `${this.apiUrl}/user/${userId}`,
      { params }
    );
  }

  // owner
  getReservationsForMyField(fieldId: number|null, page: number=1, pageSize: number=50) {
     const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<IReservationsResponse>(`${this.apiUrl}/field/${fieldId}`, { params });
  }
}

