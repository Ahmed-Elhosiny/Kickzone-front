import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth';
import { IConfirmEmail } from '../../Interfaces/iauth-extended';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css'
})
export class ConfirmEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  isSuccess = false;
  errorMessage = '';
  email = '';
  token = '';

  ngOnInit(): void {
    // Get email and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.isLoading = false;
        this.errorMessage = 'Invalid confirmation link. Email or token is missing.';
        return;
      }

      this.confirmEmail();
    });
  }

  confirmEmail(): void {
    const data: IConfirmEmail = {
      email: this.email,
      token: this.token
    };

    this.authService.confirmEmail(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.snackBar.open('✅ Email confirmed successfully!', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = err.error?.message || err.error || 'Failed to confirm email. The link may be invalid or expired.';
        this.snackBar.open(`❌ ${this.errorMessage}`, 'Close', {
          duration: 7000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
