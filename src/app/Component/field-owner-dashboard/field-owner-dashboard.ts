import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth';
import { UserService } from '../../services/user/user.service';
import { FieldService } from '../../services/Field/field-service';
import { IUserProfile } from '../../iuser';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-field-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './field-owner-dashboard.html',
  styleUrls: ['./field-owner-dashboard.css']
})
export class FieldOwnerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private fieldService = inject(FieldService);
  
  currentUser: IUserProfile | null = null;
  isLoadingUser = true;
  isLoadingStats = true;
  statsError = '';
  activeTab: string = 'my-fields';

  stats = {
    total: 0,
    approved: 0,
    pending: 0,
    documentRequired: 0
  };

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadUserProfile();
    this.loadStats(userId);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  private loadUserProfile(): void {
    this.isLoadingUser = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isLoadingUser = false;
      },
      error: () => {
        // Fall back to a minimal user object if the profile endpoint fails
        this.currentUser = null;
        this.isLoadingUser = false;
      }
    });
  }

  private loadStats(ownerId: number): void {
    this.isLoadingStats = true;
    this.statsError = '';

    this.fieldService.getFieldsByOwner(ownerId).subscribe({
      next: (fields: IField[]) => {
        const approved = fields.filter(f => f.isApproved === true).length;
        const pending = fields.filter(f => f.hasApprovalDocument && f.isApproved === null).length;
        const documentRequired = fields.filter(f => !f.hasApprovalDocument).length;

        this.stats = {
          total: fields.length,
          approved,
          pending,
          documentRequired
        };

        this.isLoadingStats = false;
      },
      error: () => {
        this.statsError = 'Unable to load your overview right now.';
        this.isLoadingStats = false;
      }
    });
  }

  getDisplayName(): string {
    return this.currentUser?.name || this.currentUser?.userName || 'Owner';
  }

  getInitials(): string {
    const name = this.getDisplayName();
    const parts = name.trim().split(' ');
    const first = parts[0]?.charAt(0) || 'O';
    const second = parts.length > 1 ? parts[1].charAt(0) : '';
    return `${first}${second}`.toUpperCase();
  }
}
