import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  // Use signals for reactive state
  isLoading = signal(true);
  isSuccess = signal(false);
  errorMessage = signal('');
  userId = signal<number | null>(null);
  newEmail = signal('');
  Token = signal('');

  // Convert queryParams to a signal
  private queryParams = toSignal(this.route.queryParams);

  constructor() {
    // Use effect to react to query params changes
    effect(() => {
      const params = this.queryParams();
      if (params) {
        console.log('Query params received:', params);
        this.userId.set(params['userId'] ? parseInt(params['userId'], 10) : null);
        this.newEmail.set(params['newEmail'] || '');
        this.Token.set(decodeURIComponent(params['token'] || ''));

        console.log('Extracted values - userId:', this.userId(), 'newEmail:', this.newEmail(), 'Token:', this.Token() ? 'present' : 'missing');

        if (!this.userId() || !this.newEmail() || !this.Token()) {
          console.log('Validation failed: missing required parameters');
          this.isLoading.set(false);
          this.errorMessage.set('Invalid confirmation link. Required parameters are missing.');
          return;
        }

        console.log('Proceeding to confirm email change');
        this.confirmEmailChange();
      }
    });
  }

  ngOnInit(): void {
    // No longer needed
  }

  confirmEmailChange(): void {
    const data: IConfirmEmailChange = {
      userId: this.userId()!,
      Token: this.Token(),
      newEmail: this.newEmail()
    };

    console.log('Sending data to confirm email change:', data);

    this.userService.confirmEmailChange(data).subscribe({
      next: (response) => {
        console.log('Email change confirmed successfully:', response);
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.snackBar.open('Email changed! Login with your new email', 'Close', {
          duration: 6000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error confirming email change:', err);
        this.isLoading.set(false);
        this.isSuccess.set(false);
        this.errorMessage.set(err.error?.message || err.error || 'Failed to confirm email change. The link may be invalid or expired.');
        this.snackBar.open(this.errorMessage(), 'Close', {
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
