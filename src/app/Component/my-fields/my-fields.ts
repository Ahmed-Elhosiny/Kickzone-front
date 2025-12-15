import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, timeout } from 'rxjs/operators';

import { FieldService } from '../../services/Field/field-service';
import { AuthService } from '../../auth/auth';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-my-fields',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './my-fields.html',
  styleUrls: ['./my-fields.css'],
})
export class MyFieldsComponent implements OnInit {
  // ===== Injected Services =====
  private readonly fieldService = inject(FieldService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // ===== Signals =====
  readonly fields = signal<IField[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly uploadingDocId = signal<number | null>(null);
  readonly deletingFieldId = signal<number | null>(null);

  // ===== Computed =====
  readonly hasFields = computed(() => this.fields().length > 0);
  readonly approvedFieldsCount = computed(() => 
    this.fields().filter(f => f.isApproved === true).length
  );
  readonly pendingFieldsCount = computed(() => 
    this.fields().filter(f => f.isApproved === null && f.hasApprovalDocument).length
  );

  ngOnInit(): void {
    this.loadOwnerFields();
  }

  // ===== Data =====
  loadOwnerFields(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading.set(false);
      this.error.set('User not authenticated');
      this.snackBar.open('Please login to view your fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.router.navigate(['/login']);
      return;
    }

    this.fieldService.getFieldsByOwner(userId).subscribe({
      next: (data) => {
        this.fields.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err?.error?.message || 'Failed to load your fields';
        this.error.set(errorMessage);
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  // ===== Actions =====
  editField(fieldId: number): void {
    this.router.navigate(['/field-owner/edit-field', fieldId]);
  }

  confirmDelete(field: IField): void {
    const fieldName = field.name;
    this.deletingFieldId.set(field.id);
    
    // Simple confirmation dialog
    if (confirm(`Are you sure you want to delete "${fieldName}"? This action cannot be undone.`)) {
      this.deleteField(field.id);
    } else {
      this.deletingFieldId.set(null);
    }
  }

  deleteField(fieldId: number): void {
    this.fieldService.deleteField(fieldId).subscribe({
      next: () => {
        this.fields.update((list) =>
          list.filter((f) => f.id !== fieldId)
        );
        this.deletingFieldId.set(null);
        this.snackBar.open('Field deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
      },
      error: (err) => {
        this.deletingFieldId.set(null);
        const errorMessage = err?.error?.message || 'Failed to delete field';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  // ===== Helpers =====
  getMainImage(field: IField): string {
    return field.fieldImages?.[0]?.imageUrl ?? '/images/placeholder-field.jpg';
  }

  getStatusText(field: IField): string {
    if (!field.hasApprovalDocument) return 'Document Required';
    if (field.isApproved === null) return 'Pending Review';
    if (field.isApproved === false) return 'Rejected';
    return 'Approved';
  }

  getStatusClass(field: IField): string {
    if (!field.hasApprovalDocument) return 'status-no-doc';
    if (field.isApproved === null) return 'status-pending';
    if (field.isApproved === false) return 'status-rejected';
    return 'status-approved';
  }

  getStatusIcon(field: IField): string {
    if (!field.hasApprovalDocument) return 'description';
    if (field.isApproved === null) return 'schedule';
    if (field.isApproved === false) return 'cancel';
    return 'check_circle';
  }

  // ===== Upload =====
  uploadDocument(fieldId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.snackBar.open('Please upload a PDF document', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      input.value = '';
      return;
    }

    this.uploadingDocId.set(fieldId);

    this.fieldService
      .uploadFieldDocument(fieldId, file)
      .pipe(
        timeout(20000),
        finalize(() => {
          this.uploadingDocId.set(null);
          input.value = '';
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Document uploaded successfully. Awaiting admin review.', 'Close', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          // Update the fields list immediately so the UI shows "Pending Review"
          this.fields.update(list =>
            list.map(f => f.id === fieldId ? { ...f, hasApprovalDocument: true, isApproved: null } : f)
          );
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Failed to upload document. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  // ===== Navigation =====
  goToField(fieldId: number): void {
    this.router.navigate(['/field', fieldId]);
  }
}
