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
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Set a basic user object with the ID
    this.currentUser = { id: userId };
    
    // Check if we're at the parent route without a child route
    if (this.router.url === '/field-owner' || this.router.url === '/field-owner/') {
      this.router.navigate(['/field-owner/my-fields'], { replaceUrl: true });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
