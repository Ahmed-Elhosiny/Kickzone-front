import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth';
import { IConfirmEmail } from '../../Interfaces/iauth-extended';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css'
})
export class ConfirmEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSuccess = false;
  needsUserId = false;
  errorMessage = '';
  userId: number | null = null;
  token = '';
  userIdForm: FormGroup;

  constructor() {
    this.userIdForm = this.fb.group({
      userId: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngOnInit(): void {
    // Get userId and token from query parameters
    const params = this.route.snapshot.queryParams;
    
    console.log('Query params:', params);
    
    const userIdParam = params['userId'] || params['UserId'] || '';
    this.userId = userIdParam ? parseInt(userIdParam, 10) : null;
    this.token = params['token'] || '';

    console.log('Extracted - UserId:', this.userId, 'Token:', this.token ? 'present' : 'missing');

    if (!this.token) {
      console.log('No token found');
      this.isLoading = false;
      this.errorMessage = 'Invalid confirmation link. Token is missing.';
      return;
    }

    if (!this.userId || isNaN(this.userId)) {
      console.log('No valid userId found');
      this.isLoading = false;
      this.needsUserId = true;
      return;
    }

    console.log('Proceeding with email confirmation');
    this.confirmEmail();
  }

  confirmEmail(): void {
    if (!this.userId) {
      this.errorMessage = 'User ID is required for email confirmation.';
      this.isLoading = false;
      return;
    }

    const data: IConfirmEmail = {
      UserId: this.userId,
      token: this.token
    };

    console.log('Confirming email with data:', data);

    this.authService.confirmEmail(data).subscribe({
      next: (response) => {
        console.log('Email confirmation successful:', response);
        
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.isSuccess = true;
          this.needsUserId = false;
          this.errorMessage = '';
          this.cdr.markForCheck();
          
          this.snackBar.open('Email verified successfully!', '×', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        }, 0);
      },
      error: (err) => {
        console.error('Email confirmation error:', err);
        
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.isSuccess = false;
          this.needsUserId = false;
          this.errorMessage = err.error?.message || err.error || 'Failed to confirm email. The link may be invalid or expired.';
          this.cdr.markForCheck();
          
          this.snackBar.open(this.errorMessage, '×', {
            duration: 7000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }, 0);
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToResendVerification(): void {
    this.router.navigate(['/resend-verification']);
  }

  submitUserIdAndConfirm(): void {
    if (this.userIdForm.invalid) {
      this.userIdForm.markAllAsTouched();
      return;
    }

    // Set states immediately before making API call
    this.userId = parseInt(this.userIdForm.value.userId, 10);
    this.needsUserId = false;
    this.isLoading = true;
    this.isSuccess = false;
    this.errorMessage = '';
    
    this.confirmEmail();
  }
}
