import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth';
import { IGetReservationDto } from '../../Model/IReservation/ireservation-dto';
import { ReservationService } from '../../services/Reservation/reservation';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {
  reservations = signal<IGetReservationDto[]>([]);
  loading = signal(false);
  page = signal(1);
  pageSize = signal(6);
  totalCount = signal(0);

  startIndex = computed(() => {
    return (this.page() - 1) * this.pageSize();
  });

  numberOfPages = computed(() => {
    return Math.ceil(this.totalCount() / this.pageSize());
  });
  constructor(
    private reservationService: ReservationService,
    private authService: AuthService) {

    effect(() => this.loadReservations());
  }

  loadReservations() {
    this.loading.set(true);

    const userId = this.authService.getUserId();
    if (!userId || !this.authService.isAuthenticated()) {
      this.loading.set(false);
      return;
    }

    this.reservationService.getMyReservations(userId, this.page(), this.pageSize()).subscribe({
      next: (res) => {
        this.reservations.set(res.reservations);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching reservations:', err.error);
        this.loading.set(false)
      },
    });
  }

  goToPage(pageNumber: number) {
    this.page.set(pageNumber);
  }

  getLocalDate(slotStart: string): Date {
    return new Date(slotStart);
  }

}
