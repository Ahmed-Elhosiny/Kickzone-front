import { Component, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBarComponent {
  private platformId = inject(PLATFORM_ID);
  public authService = inject(AuthService);
  private router = inject(Router);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Navigate to login even if API call fails (tokens already cleared)
        this.router.navigate(['/login']);
      }
    });
  }
  get isAdmin(): boolean {
  return this.authService.getUserRole() === 'Admin';
}


  cart(): void {
    this.router.navigate(['/reservation-cart']);
  }
}
