import { Injectable, signal } from '@angular/core';
import { ReservationService } from './Reservation/reservation';
import { IReservation } from '../Model/IReservation/ireservation';

@Injectable({ providedIn: 'root' })
export class GlobalReservationsService {
  reservations = signal<IReservation[]>([]);
  loading = signal(true);

  constructor(private reservationService: ReservationService) {}

  loadReservations() {
    this.loading.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (res) => {
        this.reservations.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

