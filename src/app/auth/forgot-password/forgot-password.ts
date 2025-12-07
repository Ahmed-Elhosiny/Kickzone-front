import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  emailSent = false;
  private snackBar = inject(MatSnackBar);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
        this.snackBar.open('Password reset instructions sent to your email!', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Forgot password error:', err);
        
        let errorMessage = 'Failed to send reset email. Please try again.';
        if (err?.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
