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
  needsEmail = false;
  errorMessage = '';
  email = '';
  token = '';
  emailForm: FormGroup;

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Get email/userId and token from query parameters using snapshot to avoid re-triggering
    const params = this.route.snapshot.queryParams;
    
    console.log('Query params:', params);
    
    // Backend sends userId, but we need email for the API
    // Check if email is provided, otherwise check for userId
    this.email = params['email'] || '';
    const userId = params['userId'] || '';
    this.token = params['token'] || '';

    console.log('Extracted - Email:', this.email, 'UserId:', userId, 'Token:', this.token ? 'present' : 'missing');

    // If we have userId but no email, we need to get it from localStorage or ask user
    // This happens when the backend sends userId in the confirmation link
    if (!this.email && userId) {
      // Try to get email from localStorage (saved during registration)
      const registrationEmail = this.getStoredRegistrationEmail();
      console.log('Registration email from localStorage:', registrationEmail);
      
      if (registrationEmail) {
        this.email = registrationEmail;
      } else {
        // Ask user to provide their email
        console.log('No email found, showing email input form');
        this.isLoading = false;
        this.needsEmail = true;
        return;
      }
    }

    if (!this.token) {
      console.log('No token found');
      this.isLoading = false;
      this.errorMessage = 'Invalid confirmation link. Token is missing.';
      return;
    }

    if (!this.email) {
      console.log('No email found after all checks');
      this.isLoading = false;
      this.needsEmail = true;
      return;
    }

    console.log('Proceeding with email confirmation');
    this.confirmEmail();
  }

  private getStoredRegistrationEmail(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('pending_email_confirmation');
    }
    return null;
  }

  confirmEmail(): void {
    const data: IConfirmEmail = {
      email: this.email,
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
          this.needsEmail = false;
          this.errorMessage = '';
          this.cdr.markForCheck();
          
          // Clear stored email after successful confirmation
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.removeItem('pending_email_confirmation');
          }
          
          this.snackBar.open('✅ Email confirmed successfully!', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }, 0);
      },
      error: (err) => {
        console.error('Email confirmation error:', err);
        
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.isSuccess = false;
          this.needsEmail = false;
          this.errorMessage = err.error?.message || err.error || 'Failed to confirm email. The link may be invalid or expired.';
          this.cdr.markForCheck();
          
          this.snackBar.open(`❌ ${this.errorMessage}`, 'Close', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
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

  submitEmailAndConfirm(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    // Set states immediately before making API call
    this.email = this.emailForm.value.email;
    this.needsEmail = false;
    this.isLoading = true;
    this.isSuccess = false;
    this.errorMessage = '';
    
    this.confirmEmail();
  }
}
