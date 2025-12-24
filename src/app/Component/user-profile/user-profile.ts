import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../auth/auth';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent implements OnInit {
  // ===== Injected Services =====
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // ===== Signals =====
  userProfile = signal<IUserProfile | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  editMode = signal(false);
  emailChangeRequested = signal(false);
  submitting = signal(false);
  
  // Password visibility toggles
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // ===== Computed Values =====
  displayName = computed(() => {
    const profile = this.userProfile();
    return profile?.name || profile?.userName || 'User';
  });

  userRole = computed(() => {
    const profile = this.userProfile();
    if (!profile?.roles || profile.roles.length === 0) return 'Player';
    if (profile.roles.includes('Admin')) return 'Admin';
    if (profile.roles.includes('FieldOwner')) return 'Field Owner';
    return 'Player';
  });

  roleIcon = computed(() => {
    const role = this.userRole();
    if (role === 'Admin') return 'admin_panel_settings';
    if (role === 'Field Owner') return 'store';
    return 'person';
  });

  // ===== Forms =====
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  changeUsernameForm: FormGroup;
  changeEmailForm: FormGroup;

  constructor() {
    // Initialize forms
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

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
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
      this.snackBar.open('Please login first to view your profile', 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
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
        } else if (err?.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        }

        this.error.set(errorMessage);
        this.snackBar.open(errorMessage, 'Close', {
          duration: 8000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });

        if (shouldLogout) {
          setTimeout(() => {
            this.authService.logout().subscribe({
              next: () => this.router.navigate(['/login']),
              error: () => this.router.navigate(['/login']),
            });
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
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
      }
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Please fix the errors before saving', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
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
      this.snackBar.open('No changes detected', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['info-snackbar']
      });
      return;
    }

    this.submitting.set(true);
    this.userService.updateProfile(updatedData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.editMode.set(false);
        this.loadUserProfile();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Failed to update profile:', err);
        const errorMessage = err?.error?.message || 'Failed to update profile. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
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

    if (currentPassword === newPassword) {
      this.snackBar.open('New password must be different from current password', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.submitting.set(true);
    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.changePasswordForm.reset();
        this.showCurrentPassword.set(false);
        this.showNewPassword.set(false);
        this.showConfirmPassword.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Failed to change password:', err);
        let errorMessage = err?.error?.message || 'Failed to change password. Please check your current password.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
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
    const currentProfile = this.userProfile();

    if (newUserName === currentProfile?.userName) {
      this.snackBar.open('New username must be different from current username', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.submitting.set(true);
    this.userService.changeUsername({ newUserName }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Username changed successfully!', 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.changeUsernameForm.reset();
        this.loadUserProfile();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Failed to change username:', err);
        const errorMessage = err?.error?.message || err?.error || 'Failed to change username. Username may already be taken.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
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
    const currentProfile = this.userProfile();

    if (newEmail === currentProfile?.email) {
      this.snackBar.open('New email must be different from current email', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.submitting.set(true);
    this.userService.requestEmailChange({ newEmail }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.emailChangeRequested.set(true);
        this.snackBar.open('Confirmation email sent! Please check your inbox', 'Close', {
          duration: 6000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.changeEmailForm.reset();

        // Reset the flag after 60 seconds
        setTimeout(() => {
          this.emailChangeRequested.set(false);
        }, 60000);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Failed to request email change:', err);
        const errorMessage = err?.error?.message || err?.error || 'Failed to request email change. Email may already be in use.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
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
