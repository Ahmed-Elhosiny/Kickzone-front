import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { IRegister } from '../../Interfaces/iregister';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,

  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class RegisterComponent {
  registerForm: FormGroup;
  private snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],

      phoneNumber: ['', [Validators.required, Validators.pattern(/^(010|012|015|011)[0-9]{8}$/)]],
      name: ['', Validators.required],
      location: ['', Validators.required],
      role: ['User', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$/)]],
    });
  }
  get f() {
    return this.registerForm.controls;
  }
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const user: IRegister = this.registerForm.value;

    this.authService.register(user)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => {
          console.log('Registration successful:', res);
          this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.snackBar.open('Registration failed!', 'Close', { duration: 3000 });
        },
      });
  }
}
