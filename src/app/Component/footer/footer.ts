import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  private readonly authService = inject(AuthService);
  
  // ===== Signals =====
  readonly currentYear = signal(new Date().getFullYear());
  readonly companyEmail = signal('kickzone.info.egypt@gmail.com');
  
  // Authentication state
  private readonly authState = toSignal(this.authService.isAuthenticated$, { initialValue: this.authService.isAuthenticated() });
  readonly isFieldOwner = computed(() => this.authState() && this.authService.getUserRole() === 'FieldOwner');
  
  readonly brandInfo = signal({
    name: 'KickZone',
    tagline: 'Where Sport Time Starts',
    description: 'Your premier platform for booking sports fields across Egypt'
  });

  readonly socialLinks = signal([
    { icon: 'facebook', url: 'https://facebook.com/kickzone', label: 'Follow us on Facebook', color: '#1877f2' },
    { icon: 'photo_camera', url: 'https://instagram.com/kickzone', label: 'Follow us on Instagram', color: '#e4405f' },
    { icon: 'mail', url: `mailto:${this.companyEmail()}`, label: 'Email us', color: '#ffc107' },
  ]);

  readonly quickLinks = signal([
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'search', label: 'Find Fields', route: '/result' },
    { icon: 'person_add', label: 'Sign Up', route: '/register' },
    { icon: 'login', label: 'Login', route: '/login' },
  ]);

  readonly ownerLinks = signal([
    { icon: 'dashboard', label: 'Owner Dashboard', route: '/field-owner/my-fields' },
    { icon: 'add_business', label: 'List Your Field', route: '/field-owner/add-field' },
  ]);

  readonly legalLinks = signal([
    { icon: 'privacy_tip', label: 'Privacy Policy', route: '/privacy' },
    { icon: 'gavel', label: 'Terms of Service', route: '/terms' },
    { icon: 'cookie', label: 'Cookie Policy', route: '/cookies' },
  ]);

  readonly contactInfo = signal([
    { icon: 'email', label: this.companyEmail(), type: 'email', link: `mailto:${this.companyEmail()}` },
    { icon: 'location_on', label: 'PortSaid, Egypt', type: 'text' },
  ]);

  readonly stats = signal([
    { icon: 'sports_soccer', value: '500+', label: 'Fields' },
    { icon: 'groups', value: '10K+', label: 'Players' },
    { icon: 'verified', value: '100%', label: 'Verified' },
  ]);
}
