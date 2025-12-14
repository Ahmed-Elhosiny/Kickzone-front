import { Component, signal, computed, inject,OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/auth';
import { UserBookingService } from '../../services/user-bookings';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css'],
})
export class NavBarComponent {
  // ===== Injected Services =====
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  public userBooking: UserBookingService = inject(UserBookingService);

  // ===== Signals =====
  readonly isLoggingOut = signal(false);
  readonly mobileMenuOpen = signal(false);

  // Convert authentication observable to signal for reactive updates
  private readonly authState = toSignal(this.authService.isAuthenticated$, { initialValue: this.authService.isAuthenticated() });

  // ===== Computed Values =====
  readonly isAuthenticated = computed(() => this.authState());
  readonly isAdmin = computed(() => this.authState() && this.authService.getUserRole() === 'Admin');
  readonly isFieldOwner = computed(() => this.authState() && this.authService.getUserRole() === 'FieldOwner');
  readonly userRole = computed(() => this.authState() ? this.authService.getUserRole() : null);
  readonly userName = computed(() => this.authState() ? (this.authService.getUserName() || 'User') : null);

  // ===== Paid Reservations Computed =====
  readonly hasPaidReservations = computed(() =>
    this.userBooking.paidReservations().length > 0
  );

  // ===== Actions =====
  logout(): void {
    if (this.isLoggingOut()) return;

    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut.set(false);
        this.snackBar.open('Logged out successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoggingOut.set(false);
        this.router.navigate(['/login']);
      }
    });
  }

  navigateToCart(): void {
    this.router.navigate(['/reservation-cart']);
  }

  navigateToPaidReservations(): void {
    this.router.navigate(['/my-bookings']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  ngOnInit(): void {
  if (this.isAuthenticated()) {
    this.userBooking.loadReservations();
  }
}

}
