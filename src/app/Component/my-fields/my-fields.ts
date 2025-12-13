import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';

import { FieldService } from '../../services/Field/field-service';
import { AuthService } from '../../auth/auth';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-my-fields',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-fields.html',
  styleUrls: ['./my-fields.css'],
})
export class MyFieldsComponent implements OnInit {
  private readonly fieldService = inject(FieldService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ===== Signals =====
  readonly fields = signal<IField[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly deleteConfirmId = signal<number | null>(null);
  readonly uploadingDocId = signal<number | null>(null);

  // ===== Computed =====
  readonly hasFields = computed(() => this.fields().length > 0);

  ngOnInit(): void {
    this.loadOwnerFields();
  }

  // ===== Data =====
  loadOwnerFields(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage.set('User not authenticated');
      this.isLoading.set(false);
      this.router.navigate(['/login']);
      return;
    }

    this.fieldService.getFieldsByOwner(userId).subscribe({
      next: (data) => {
        this.fields.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load your fields');
        this.isLoading.set(false);
      },
    });
  }

  // ===== Actions =====
  editField(fieldId: number): void {
    this.router.navigate(['/field-owner/edit-field', fieldId]);
  }

  confirmDelete(fieldId: number): void {
    this.deleteConfirmId.set(fieldId);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  deleteField(fieldId: number): void {
    this.fieldService.deleteField(fieldId).subscribe({
      next: () => {
        this.fields.update((list) =>
          list.filter((f) => f.id !== fieldId)
        );
        this.deleteConfirmId.set(null);
        this.showSuccess('Field deleted successfully');
      },
      error: () => {
        this.deleteConfirmId.set(null);
        this.showError('Failed to delete field');
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

  // ===== Upload =====
  uploadDocument(fieldId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.showError('Please upload a PDF document');
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
          this.showSuccess('Document uploaded. Awaiting admin review.');
          this.loadOwnerFields();
        },
        error: () => {
          this.showError('Failed to upload document');
        },
      });
  }

  // ===== UI Messages =====
  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 3000);
  }
}
