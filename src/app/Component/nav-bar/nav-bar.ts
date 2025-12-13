import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/auth';

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
  styleUrl: './nav-bar.css',
})
export class NavBarComponent {
  // ===== Injected Services =====
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // ===== Signals =====
  readonly isLoggingOut = signal(false);
  readonly mobileMenuOpen = signal(false);

  // ===== Computed Values =====
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.authService.getUserRole() === 'Admin');
  readonly userRole = computed(() => this.authService.getUserRole());
  readonly userName = computed(() => this.authService.getUserName() || 'User');

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
        // Navigate to login even if API call fails (tokens already cleared)
        this.router.navigate(['/login']);
      }
    });
  }

  navigateToCart(): void {
    this.router.navigate(['/reservation-cart']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
