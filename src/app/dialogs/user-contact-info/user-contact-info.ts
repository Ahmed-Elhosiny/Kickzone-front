import { Component, inject, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user/user.service';
import { IUserProfile } from '../../iuser';

export interface UserContactInfoDialogData {
  userId?: number;
  username?: string;
}

@Component({
  selector: 'app-user-contact-info',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './user-contact-info.html',
  styleUrls: ['./user-contact-info.css'],
})
export class UserContactInfoComponent {
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<UserContactInfoComponent>);

  readonly isLoading = signal(true);
  user: IUserProfile | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserContactInfoDialogData) {
    this.loadUser();
  }

  private loadUser() {
    console.log('Loading user with data:', this.data);
    
    if (this.data.userId) {
      console.log('Loading user by ID:', this.data.userId);
      this.userService.getUserById(this.data.userId).subscribe({
        next: (user) => {
          console.log('User loaded successfully by ID:', user);
          this.user = user;
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading user by ID:', error);
          this.isLoading.set(false);
        }
      });
    } else if (this.data.username) {
      console.log('Loading user by username:', this.data.username);
      this.userService.getUserByUsername(this.data.username).subscribe({
        next: (user) => {
          console.log('User loaded successfully by username:', user);
          this.user = user;
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading user by username:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      console.error('No userId or username provided');
      this.isLoading.set(false);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
