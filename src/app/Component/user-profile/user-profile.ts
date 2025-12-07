import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../auth/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent implements OnInit {
  userProfile = signal<IUserProfile | null>(null);
  loading = signal(true);
  editMode = signal(false);
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
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
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.profileForm.patchValue({
          name: profile.name,
          location: profile.location || '',
          phoneNumber: profile.phoneNumber,
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to load profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
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

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

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
