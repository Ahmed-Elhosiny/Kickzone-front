import { Injectable, signal } from '@angular/core';
import { ReservationService } from './Reservation/reservation';
import { IReservation } from '../Model/IReservation/ireservation';
import { AuthService } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class UserBookingService {
  reservations = signal<IReservation[]>([]);
  loading = signal(true);

  constructor(private reservationService: ReservationService , private authService: AuthService) {}

  loadReservations() {
    this.loading.set(true);

    this.reservationService.getMyReservations(this.authService.getUserId()).subscribe({
      next: (res) => {
        this.reservations.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  paidReservations() {
    return this.reservations().filter(r => r.amountPaid > 0);
  }
}
