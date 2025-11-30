import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { IUser } from '../../iuser';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class Register {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      name: ['', Validators.required],
      location: ['', Validators.required],
      role: ['User'],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const user: IUser = this.registerForm.value;

    this.authService.register(user).subscribe({
      next: res => {
        console.log('Registration successful:', res);
        alert('Registration successful!');
      },
      error: err => {
        console.error('Registration error:', err);
        alert('Registration failed!');
      }
    });
  }
}
