import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../auth';
import { IRegister } from '../../Interfaces/iregister';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  private snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        email: ['', 
          [Validators.required, Validators.email],
          [this.emailAvailabilityValidator()]
        ],
        userName: ['', 
          [Validators.required, Validators.minLength(3)],
          [this.usernameAvailabilityValidator()]
        ],
        phoneNumber: ['', 
          [Validators.required, Validators.pattern(/^(010|012|015|011)[0-9]{8}$/)],
          [this.phoneAvailabilityValidator()]
        ],
        name: ['', [Validators.required, Validators.maxLength(200)]],
        location: [''],  // Optional field
        role: ['User', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Async validator for email availability
  emailAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.hasError('required') || control.hasError('email')) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => 
          this.authService.checkAvailability({ email }).pipe(
            map(response => {
              // Backend returns true if available, false if taken
              return response.isAvailable ? null : { emailTaken: true };
            }),
            catchError(() => of(null)) // If error, don't block registration
          )
        )
      );
    };
  }

  // Async validator for username availability
  usernameAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.hasError('required') || control.hasError('minlength')) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => 
          this.authService.checkAvailability({ username }).pipe(
            map(response => {
              return response.isAvailable ? null : { usernameTaken: true };
            }),
            catchError(() => of(null))
          )
        )
      );
    };
  }

  // Async validator for phone availability
  phoneAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.hasError('required') || control.hasError('pattern')) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(phone => 
          this.authService.checkAvailability({ phone }).pipe(
            map(response => {
              return response.isAvailable ? null : { phoneTaken: true };
            }),
            catchError(() => of(null))
          )
        )
      );
    };
  }

  get f() {
    return this.registerForm.controls;
  }
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { confirmPassword, ...user } = this.registerForm.value;

    this.authService.register(user as IRegister).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Registration successful:', res);
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        
        // Extract error message from backend response
        let errorMessage = 'Registration failed. Please try again.';
        if (err?.error?.errors) {
          // Validation errors from backend
          const errors = err.error.errors;
          const errorArray = Object.entries(errors).map(([field, messages]: [string, any]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          });
          errorMessage = errorArray.join('\n');
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.error?.title) {
          errorMessage = err.error.title;
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
