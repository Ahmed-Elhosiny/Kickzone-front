import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../services/user/user.service';
import { IConfirmEmailChange } from '../../Interfaces/iauth-extended';

@Component({
  selector: 'app-confirm-email-change',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './confirm-email-change.html',
  styleUrl: './confirm-email-change.css'
})
export class ConfirmEmailChangeComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  isSuccess = false;
  errorMessage = '';
  email = '';
  newEmail = '';
  token = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.newEmail = params['newEmail'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.newEmail || !this.token) {
        this.isLoading = false;
        this.errorMessage = 'Invalid confirmation link. Required parameters are missing.';
        return;
      }

      this.confirmEmailChange();
    });
  }

  confirmEmailChange(): void {
    const data: IConfirmEmailChange = {
      newEmail: this.newEmail,
      token: this.token
    };

    this.userService.confirmEmailChange(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.snackBar.open('Email changed! Login with your new email', 'Close', {
          duration: 6000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = err.error?.message || err.error || 'Failed to confirm email change. The link may be invalid or expired.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 7000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
