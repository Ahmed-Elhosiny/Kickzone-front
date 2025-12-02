import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { IRegister } from '../../Interfaces/iregister';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive]

})
export class Register {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],
      phoneNumber: ['', [Validators.required,Validators.pattern(/^(010|012|015|011)[0-9]{8}$/)]],
      name: ['', Validators.required],
      location: ['', Validators.required],
      role: ['User', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/)]],
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
