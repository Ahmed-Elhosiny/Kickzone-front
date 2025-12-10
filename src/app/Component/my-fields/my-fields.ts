import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FieldService } from '../../services/Field/field-service';
import { AuthService } from '../../auth/auth';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-my-fields',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-fields.html',
  styleUrls: ['./my-fields.css']
})
export class MyFieldsComponent implements OnInit {
  private fieldService = inject(FieldService);
  private authService = inject(AuthService);
  private router = inject(Router);

  fields: IField[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  deleteConfirmId: number | null = null;

  ngOnInit(): void {
    this.loadOwnerFields();
  }

  loadOwnerFields(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.errorMessage = 'User not authenticated';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.fieldService.getFieldsByOwner(userId).subscribe({
      next: (data) => {
        this.fields = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading fields:', err);
        this.errorMessage = 'Failed to load your fields';
        this.isLoading = false;
      }
    });
  }

  editField(fieldId: number): void {
    this.router.navigate(['/field-owner/edit-field', fieldId]);
  }

  confirmDelete(fieldId: number): void {
    this.deleteConfirmId = fieldId;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteField(fieldId: number): void {
    this.fieldService.deleteField(fieldId).subscribe({
      next: () => {
        this.successMessage = 'Field deleted successfully';
        this.deleteConfirmId = null;
        // Remove the deleted field from the list
        this.fields = this.fields.filter(f => f.id !== fieldId);
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error deleting field:', err);
        this.errorMessage = 'Failed to delete field';
        this.deleteConfirmId = null;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  getStatusClass(field: IField): string {
    if (field.isApproved === null) return 'status-pending';
    return field.isApproved ? 'status-approved' : 'status-rejected';
  }

  getStatusText(field: IField): string {
    if (field.isApproved === null) return 'Pending Approval';
    return field.isApproved ? 'Approved' : 'Rejected';
  }

  getMainImage(field: IField): string {
    if (field.fieldImages && field.fieldImages.length > 0 && field.fieldImages[0].imageUrl) {
      return field.fieldImages[0].imageUrl;
    }
    return '/images/placeholder-field.jpg';
  }

  uploadDocument(fieldId: number, event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fieldService.uploadFieldDocument(fieldId, file).subscribe({
        next: () => {
          this.successMessage = 'Document uploaded successfully';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Error uploading document:', err);
          this.errorMessage = 'Failed to upload document';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }
}
