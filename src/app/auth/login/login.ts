import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  serverError: string | null = null;
  showPassword = false;
  private platformId = inject(PLATFORM_ID);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      emailOrUserName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.serverError = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { emailOrUserName, password } = this.loginForm.value;

    this.auth.login({ emailOrUserName, password })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => {
          console.log('Login successful:', res);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
          }
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Login failed:', err);
          this.serverError = err?.error?.message || 'Login failed';
        },
      });
  }
}
