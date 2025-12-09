import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../auth/auth';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { IUserProfile } from '../../iuser';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent implements OnInit {
  userProfile = signal<IUserProfile | null>(null);
  loading = signal(true);
  editMode = signal(false);
  emailChangeRequested = signal(false);
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  changeUsernameForm: FormGroup;
  changeEmailForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  private snackBar = inject(MatSnackBar);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      location: ['', [Validators.maxLength(500)]],
      phoneNumber: ['', [Validators.pattern(/^(010|012|015|011)[0-9]{8}$/)]],
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });

    this.changeUsernameForm = this.fb.group({
      newUserName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    });

    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
    });
  }

  passwordMatchValidator(control: any): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  ngOnInit() {
    const token = this.authService.getToken();
    const isAuth = this.authService.isAuthenticated();
    const allKeys = Object.keys(localStorage);
    
    console.log('===========================================');
    console.log('🔍 PROFILE COMPONENT - AUTHENTICATION CHECK');
    console.log('===========================================');
    console.log('Has token:', !!token);
    console.log('Is authenticated:', isAuth);
    console.log('All localStorage keys:', allKeys);
    console.log('Token key exists:', allKeys.includes('access_token'));
    console.log('Refresh token exists:', allKeys.includes('refresh_token'));
    
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
    } else {
      console.error('❌ NO TOKEN FOUND - You are not logged in!');
      console.error('➡️  You must LOGIN first before accessing profile');
    }
    console.log('===========================================');
    
    if (!token || !isAuth) {
      console.warn('⚠️  Redirecting to login page...');
      this.snackBar.open('🔒 Please login first to view your profile', 'Close', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('✅ Authentication OK - Loading profile...');
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading.set(true);
    console.log('Loading user profile...');
    this.userService.getCurrentUser().subscribe({
      next: (profile) => {
        console.log('Profile loaded successfully:', profile);
        this.userProfile.set(profile);
        this.profileForm.patchValue({
          name: profile.name,
          location: profile.location || '',
          phoneNumber: profile.phoneNumber,
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile - Full error:', err);
        console.error('Error status:', err?.status);
        console.error('Error message:', err?.message);
        console.error('Error URL:', err?.url);
        console.error('Redirected:', err?.redirected);
        console.error('Error details:', err?.error);
        
        this.loading.set(false);
        
        let errorMessage = 'Failed to load profile';
        let shouldLogout = false;
        
        // Check if backend redirected to /Account/Login (misconfigured authentication)
        if (err?.url?.includes('/Account/Login') || err?.redirected) {
          errorMessage = '⚠️ Backend authentication misconfigured. Please check BACKEND_FIX.md in project root.';
          shouldLogout = true;
          console.error('❌ Backend is redirecting instead of returning 401. Fix: Add OnChallenge event to JWT Bearer options.');
        } else if (err?.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          shouldLogout = true;
        } else if (err?.status === 404) {
          errorMessage = 'User profile endpoint not found. Please contact support.';
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 8000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        
        if (shouldLogout) {
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
    });
  }

  toggleEditMode() {
    this.editMode.set(!this.editMode());
    if (!this.editMode()) {
      // Reset form when canceling
      const profile = this.userProfile();
      if (profile) {
        this.profileForm.patchValue({
          name: profile.name,
          location: profile.location || '',
          phoneNumber: profile.phoneNumber,
        });
      }
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updatedData: any = {};
    const formValue = this.profileForm.value;
    const currentProfile = this.userProfile();

    if (formValue.name !== currentProfile?.name) updatedData.name = formValue.name;
    if (formValue.location !== currentProfile?.location) updatedData.location = formValue.location;
    if (formValue.phoneNumber !== currentProfile?.phoneNumber) updatedData.phoneNumber = formValue.phoneNumber;

    if (Object.keys(updatedData).length === 0) {
      this.editMode.set(false);
      return;
    }

    this.userService.updateProfile(updatedData).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.editMode.set(false);
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.snackBar.open('Failed to update profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.changePasswordForm.reset();
      },
      error: (err) => {
        console.error('Failed to change password:', err);
        let errorMessage = 'Failed to change password';
        if (err?.error?.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  changeUsername() {
    if (this.changeUsernameForm.invalid) {
      this.changeUsernameForm.markAllAsTouched();
      return;
    }

    const { newUserName } = this.changeUsernameForm.value;

    this.userService.changeUsername({ newUserName }).subscribe({
      next: () => {
        this.snackBar.open('✅ Username changed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.changeUsernameForm.reset();
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Failed to change username:', err);
        const errorMessage = err?.error?.message || err?.error || 'Failed to change username';
        this.snackBar.open(`❌ ${errorMessage}`, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  requestEmailChange() {
    if (this.changeEmailForm.invalid) {
      this.changeEmailForm.markAllAsTouched();
      return;
    }

    const { newEmail } = this.changeEmailForm.value;

    this.userService.requestEmailChange({ newEmail }).subscribe({
      next: () => {
        this.emailChangeRequested.set(true);
        this.snackBar.open('✅ Confirmation email sent! Please check your inbox.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
        this.changeEmailForm.reset();
        
        // Reset the flag after 60 seconds
        setTimeout(() => {
          this.emailChangeRequested.set(false);
        }, 60000);
      },
      error: (err) => {
        console.error('Failed to request email change:', err);
        const errorMessage = err?.error?.message || err?.error || 'Failed to request email change';
        this.snackBar.open(`❌ ${errorMessage}`, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
