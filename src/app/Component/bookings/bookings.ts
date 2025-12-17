import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBookingService } from '../../services/user-bookings';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {
  bookingService = inject(UserBookingService);
  auth = inject(AuthService);
 ngOnInit(): void {

  this.auth.isAuthenticated$.subscribe(auth => {
    if (auth) {
      this.bookingService.loadReservations();
    }
  });

  if (this.auth.isAuthenticated()) {
    this.bookingService.loadReservations();
  }
}


//   formatLocalDate(date: string) {
//   const d = new Date(date);
//   return new Date(
//     d.getTime() - d.getTimezoneOffset() * 60000
//   );
// }
getLocalDate(slotStart: string): Date {
  return new Date(slotStart);
}


}
