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
    if (!userId) {
  this.loading.set(false);
  return;
}


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

  return this.reservations().filter(r => {
    const slotDate = new Date(r.slotStart);

    return (
      !isNaN(slotDate.getTime()) &&
      slotDate.getTime() > now.getTime() &&
      Number(r.amountPaid) > 0
    );
  });
}


// upcomingPaidReservations() {
//   console.log('RESERVATIONS SIGNAL VALUE 👉', this.reservations());
//   return this.reservations();
// }

}
