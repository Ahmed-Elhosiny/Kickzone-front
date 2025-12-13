import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth';
import { UserService } from '../../services/user/user.service';
import { FieldService } from '../../services/Field/field-service';
import { IUserProfile } from '../../iuser';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-field-owner-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './field-owner-dashboard.html',
  styleUrls: ['./field-owner-dashboard.css']
})
export class FieldOwnerDashboardComponent implements OnInit {
  // ===== Injected Services =====
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private fieldService = inject(FieldService);
  private snackBar = inject(MatSnackBar);
  
  // ===== Signals =====
  currentUser = signal<IUserProfile | null>(null);
  isLoadingUser = signal(true);
  isLoadingStats = signal(true);
  statsError = signal<string | null>(null);
  fields = signal<IField[]>([]);

  // ===== Computed Values =====
  displayName = computed(() => {
    const user = this.currentUser();
    return user?.name || user?.userName || 'Owner';
  });

  initials = computed(() => {
    const name = this.displayName();
    const parts = name.trim().split(' ');
    const first = parts[0]?.charAt(0) || 'O';
    const second = parts.length > 1 ? parts[1].charAt(0) : '';
    return `${first}${second}`.toUpperCase();
  });

  stats = computed(() => {
    const fieldsList = this.fields();
    return {
      total: fieldsList.length,
      approved: fieldsList.filter(f => f.isApproved === true).length,
      pending: fieldsList.filter(f => f.hasApprovalDocument && f.isApproved === null).length,
      documentRequired: fieldsList.filter(f => !f.hasApprovalDocument).length,
    };
  });

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadUserProfile();
    this.loadStats(userId);
  }

  private loadUserProfile(): void {
    this.isLoadingUser.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isLoadingUser.set(false);
      },
      error: (err) => {
        // Fall back silently if the profile endpoint fails
        this.currentUser.set(null);
        this.isLoadingUser.set(false);
        console.warn('Failed to load user profile:', err);
      }
    });
  }

  private loadStats(ownerId: number): void {
    this.isLoadingStats.set(true);
    this.statsError.set(null);

    this.fieldService.getFieldsByOwner(ownerId).subscribe({
      next: (fields: IField[]) => {
        this.fields.set(fields);
        this.isLoadingStats.set(false);
      },
      error: (err) => {
        this.isLoadingStats.set(false);
        const errorMessage = err?.error?.message || 'Unable to load your overview right now.';
        this.statsError.set(errorMessage);
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }
}
