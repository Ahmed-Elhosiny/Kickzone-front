import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth';

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
  
  currentUser: any = null;
  activeTab: string = 'my-fields';

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
