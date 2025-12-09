import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth';
import { ISendConfirmationRequest } from '../../Interfaces/iauth-extended';

@Component({
  selector: 'app-resend-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './resend-verification.html',
  styleUrl: './resend-verification.css'
})
export class ResendVerificationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  resendForm: FormGroup;
  isLoading = signal(false);

  constructor() {
    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resendForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const data: ISendConfirmationRequest = {
      email: this.resendForm.value.email
    };

    this.authService.sendEmailConfirmation(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open(
          '✅ Verification email sent! Please check your inbox.',
          'Close',
          {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
        this.resendForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err.error?.message || err.error || 'Failed to send verification email';
        this.snackBar.open(`❌ ${errorMessage}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
