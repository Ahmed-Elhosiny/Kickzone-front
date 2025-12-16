import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBookingService } from '../../services/user-bookings';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {
  bookingService = inject(UserBookingService);

  ngOnInit(): void {
    this.bookingService.loadReservations();
  }
  formatLocalDate(date: string) {
  const d = new Date(date);
  return new Date(
    d.getTime() - d.getTimezoneOffset() * 60000
  );
}

}
