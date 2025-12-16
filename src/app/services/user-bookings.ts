import { Injectable, signal } from '@angular/core';
import { ReservationService } from './Reservation/reservation';
import { IGetReservationDto } from '../Model/IReservation/ireservation-dto';
import { AuthService } from '../auth/auth';
import { ReservationStatus } from '../Model/IReservation/ireservation-dto';

@Injectable({ providedIn: 'root' })
export class UserBookingService {
  reservations = signal<IGetReservationDto[]>([]);
  loading = signal(false);

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  loadReservations() {
    this.loading.set(true);

    const userId = this.authService.getUserId();
    if (!userId) return;

    this.reservationService.getMyReservations(userId).subscribe({
      next: (res) => {
        this.reservations.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  upcomingPaidReservations() {
    const now = new Date();

    return this.reservations().filter(r =>
      r.amountPaid > 0 &&
      r.status === ReservationStatus.Complete &&
      new Date(r.slotStart) > now
    );
  }
}
