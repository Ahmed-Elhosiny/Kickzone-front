import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  loading = signal(false);
  serverError = signal<string | null>(null);
  showPassword = signal(false);
  private platformId = inject(PLATFORM_ID);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      emailOrUserName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.serverError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { emailOrUserName, password } = this.loginForm.value;

    this.auth.login({ emailOrUserName, password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        console.log('=== Login Success Debug ===');
        console.log('Login response received:', !!response);
        console.log('Token received:', !!response?.token);
        console.log('Refresh token received:', !!response?.refreshToken);
        console.log('Token stored:', !!this.auth.getToken());
        console.log('Is authenticated:', this.auth.isAuthenticated());
        console.log('=========================');
        
        this.snackBar.open('Login successful! Welcome back', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Login failed:', err);
        
        // Extract error message from backend response
        let errorMessage = 'Login failed. Please check your credentials.';
        if (err?.error?.errors) {
          // Validation errors
          const errors = err.error.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.error?.title) {
          errorMessage = err.error.title;
        }
        
        this.serverError.set(errorMessage);
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}
