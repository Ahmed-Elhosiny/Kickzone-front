import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CityService } from '../../services/city/city-service';
import { CategoryService } from '../../services/category/category-service';
import { FieldService } from '../../services/Field/field-service';

import { ICity } from '../../Model/ICity/icity';
import { ICategory } from '../../Model/ICategory/icategory';
import { IField } from '../../Model/IField/ifield';

import { AddItemDialogComponent } from './../../dialogs/add-item/add-item';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class AdminPanelComponent implements OnInit {
  // ===== Injected Services =====
  private readonly cityService = inject(CityService);
  private readonly categoryService = inject(CategoryService);
  private readonly fieldService = inject(FieldService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // ===== Signals =====
  readonly cities = signal<ICity[]>([]);
  readonly categories = signal<ICategory[]>([]);
  readonly fields = signal<IField[]>([]);
  
  // ===== Loading States =====
  readonly isLoadingCities = signal<boolean>(false);
  readonly isLoadingCategories = signal<boolean>(false);
  readonly isLoadingFields = signal<boolean>(false);
  
  // ===== Search/Filter States =====
  readonly citySearchTerm = signal<string>('');
  readonly categorySearchTerm = signal<string>('');
  readonly fieldSearchTerm = signal<string>('');
  readonly fieldStatusFilter = signal<'all' | 'approved' | 'pending'>('all');
  
  // ===== Computed Values for Filtering =====
  readonly filteredCities = computed(() => {
    const term = this.citySearchTerm().toLowerCase();
    return this.cities().filter(city => 
      city.name.toLowerCase().includes(term)
    );
  });
  
  readonly filteredCategories = computed(() => {
    const term = this.categorySearchTerm().toLowerCase();
    return this.categories().filter(category => 
      category.name.toLowerCase().includes(term)
    );
  });
  
  readonly filteredFields = computed(() => {
    const term = this.fieldSearchTerm().toLowerCase();
    const statusFilter = this.fieldStatusFilter();
    
    return this.fields().filter(field => {
      const matchesSearch = field.name.toLowerCase().includes(term) ||
                           field.cityName.toLowerCase().includes(term) ||
                           field.categoryName.toLowerCase().includes(term);
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'approved' && field.isApproved) ||
                           (statusFilter === 'pending' && !field.isApproved);
      
      return matchesSearch && matchesStatus;
    });
  });
  
  // ===== Statistics =====
  readonly stats = computed(() => ({
    totalCities: this.cities().length,
    totalCategories: this.categories().length,
    totalFields: this.fields().length,
    approvedFields: this.fields().filter(f => f.isApproved).length,
    pendingFields: this.fields().filter(f => !f.isApproved).length
  }));

  ngOnInit(): void {
    this.loadAll();
  }

  // ===== Loaders =====
  private loadAll(): void {
    this.loadCities();
    this.loadCategories();
    this.loadFields();
  }

  loadCities(): void {
    this.isLoadingCities.set(true);
    this.cityService.GetAllCities().subscribe({
      next: (data) => {
        this.cities.set(data);
        this.isLoadingCities.set(false);
      },
      error: () => {
        this.showError('Failed to load cities');
        this.isLoadingCities.set(false);
      },
    });
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService.GetAllCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoadingCategories.set(false);
      },
      error: () => {
        this.showError('Failed to load categories');
        this.isLoadingCategories.set(false);
      },
    });
  }

  loadFields(): void {
    this.isLoadingFields.set(true);
    this.fieldService.getAllFields().subscribe({
      next: (data) => {
        this.fields.set(data);
        this.isLoadingFields.set(false);
      },
      error: () => {
        this.showError('Failed to load fields');
        this.isLoadingFields.set(false);
      },
    });
  }

  // ===== City Actions =====
  deleteCity(city: ICity): void {
    if (city.fieldsCount > 0) {
      this.showError(
        `Cannot delete city "${city.name}" because it has ${city.fieldsCount} field${city.fieldsCount > 1 ? 's' : ''}`
      );
      return;
    }

    // Show confirmation dialog
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { 
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${city.name}"?`,
        isConfirmation: true
      },
    });

    dialogRef.afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) return;

      this.cityService.deleteCity(city.id).subscribe({
        next: () => {
          this.loadCities();
          this.showSuccess(`City "${city.name}" deleted successfully`);
        },
        error: (err) =>
          this.showError(err?.error?.message ?? 'Failed to delete city'),
      });
    });
  }

  addCity(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { title: 'Add New City' },
    });

    dialogRef.afterClosed().subscribe((name?: string) => {
      if (!name) return;

      this.cityService.addCity({ name }).subscribe({
        next: () => {
          this.showSuccess('City added successfully');
          this.loadCities();
        },
        error: () => this.showError('Failed to add city'),
      });
    });
  }

  // ===== Category Actions =====
  deleteCategory(category: ICategory): void {
    if (category.fieldsCount > 0) {
      this.showError(
        `Cannot delete category "${category.name}" because it has ${category.fieldsCount} field${category.fieldsCount > 1 ? 's' : ''}`
      );
      return;
    }

    // Show confirmation dialog
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { 
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${category.name}"?`,
        isConfirmation: true
      },
    });

    dialogRef.afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) return;

      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories();
          this.showSuccess(`Category "${category.name}" deleted successfully`);
        },
        error: (err) =>
          this.showError(err?.error?.message ?? 'Failed to delete category'),
      });
    });
  }

  addCategory(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { title: 'Add New Category' },
    });

    dialogRef.afterClosed().subscribe((name?: string) => {
      if (!name) return;

      this.categoryService.addCategory({ name }).subscribe({
        next: () => {
          this.showSuccess('Category added successfully');
          this.loadCategories();
        },
        error: () => this.showError('Failed to add category'),
      });
    });
  }

  // ===== Field Actions =====
  deleteField(field: IField): void {
    // Show confirmation dialog
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { 
        title: 'Confirm Delete',
        message: `Are you sure you want to delete field "${field.name}"? This action cannot be undone.`,
        isConfirmation: true
      },
    });

    dialogRef.afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) return;

      this.fieldService.deleteField(field.id).subscribe({
        next: () => {
          this.loadFields();
          this.showSuccess(`Field "${field.name}" deleted successfully`);
        },
        error: (err) =>
          this.showError(err?.error?.message ?? 'Failed to delete field'),
      });
    });
  }

  approveField(field: IField): void {
    if (field.isApproved) {
      this.showError(`Field "${field.name}" is already approved`);
      return;
    }

    this.fieldService.approveField(field.id).subscribe({
      next: () => {
        this.loadFields();
        this.showSuccess(`Field "${field.name}" approved successfully`);
      },
      error: (err) => this.showError(err?.error?.message ?? 'Error approving field'),
    });
  }

  rejectField(field: IField): void {
    if (!field.isApproved) {
      this.showError(`Field "${field.name}" is already rejected/pending`);
      return;
    }

    // Show confirmation dialog
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { 
        title: 'Confirm Rejection',
        message: `Are you sure you want to reject field "${field.name}"?`,
        isConfirmation: true
      },
    });

    dialogRef.afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) return;

      this.fieldService.rejectField(field.id).subscribe({
        next: () => {
          this.loadFields();
          this.showSuccess(`Field "${field.name}" rejected`);
        },
        error: (err) => this.showError(err?.error?.message ?? 'Error rejecting field'),
      });
    });
  }

  downloadPdf(field: IField): void {
    if (!field.hasApprovalDocument) {
      this.showError('No approval document available');
      return;
    }
    
    this.showSuccess('Downloading document...');
    this.fieldService.getFieldPdf(field.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${field.name}-approval-document.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('Document downloaded successfully');
      },
      error: (err) => {
        this.showError(err?.error?.message || 'Failed to download document');
      }
    });
  }

  viewReservations(field: IField): void {
    this.router.navigate(['/admin/field-reservations', field.id]);
  }

  viewWithdrawalHistory(field: IField): void {
    this.router.navigate(['/admin/withdrawal-history', field.id]);
  }

  // ===== UI Helpers =====
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
