import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ITimeSlot } from '../../Model/ITimeSlot/itime-slot';

@Injectable({
  providedIn: 'root',
})
export class TimeSlotService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/TimeSlots`;

  getAllTimeSlots(): Observable<ITimeSlot[]> {
    return this.http.get<ITimeSlot[]>(`${this.apiUrl}/all`).pipe(
      catchError((error) => {
        console.error('Error loading time slots:', error);
        return throwError(() => error);
      })
    );
  }

  getTimeSlotById(id: number): Observable<ITimeSlot> {
    return this.http.get<ITimeSlot>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error loading time slot with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  getAvailableTimeSlots(fieldId: number, date: string): Observable<ITimeSlot[]> {
    const params = {
      fieldId: fieldId.toString(),
      date: date,
    };

    return this.http.get<ITimeSlot[]>(`${this.apiUrl}/available`, { params }).pipe(
      catchError((error) => {
        console.error('Error loading available time slots:', error);
        return throwError(() => error);
      })
    );
  }

  getTimeSlotWithReservation(id: number): Observable<ITimeSlot> {
    return this.http.get<ITimeSlot>(`${this.apiUrl}/${id}/with-reservation`).pipe(
      catchError((error) => {
        console.error(`Error loading time slot ${id} with reservation:`, error);
        return throwError(() => error);
      })
    );
  }
}
