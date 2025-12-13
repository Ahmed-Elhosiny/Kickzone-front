import { Component, OnInit, signal, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

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
  imports: [MatSnackBarModule],
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

  // ===== Signals =====
  readonly cities = signal<ICity[]>([]);
  readonly categories = signal<ICategory[]>([]);
  readonly fields = signal<IField[]>([]);

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
    this.cityService.GetAllCities().subscribe({
      next: (data) => this.cities.set(data),
      error: () => this.showError('Failed to load cities'),
    });
  }

  loadCategories(): void {
    this.categoryService.GetAllCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.showError('Failed to load categories'),
    });
  }

  loadFields(): void {
    this.fieldService.getAllFields().subscribe({
      next: (data) => this.fields.set(data),
      error: () => this.showError('Failed to load fields'),
    });
  }

  // ===== City Actions =====
  deleteCity(city: ICity): void {
    if (city.fieldsCount > 0) {
      this.showError(
        `Cannot delete city "${city.name}" because it has fields`
      );
      return;
    }

    this.cityService.deleteCity(city.id).subscribe({
      next: () => {
        this.loadCities();
        this.showSuccess('City deleted successfully');
      },
      error: (err) =>
        this.showError(err?.error?.message ?? 'Failed to delete city'),
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
        `Cannot delete category "${category.name}" because it has fields`
      );
      return;
    }

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.loadCategories();
        this.showSuccess('Category deleted successfully');
      },
      error: (err) =>
        this.showError(err?.error?.message ?? 'Failed to delete category'),
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
    this.fieldService.deleteField(field.id).subscribe({
      next: () => {
        this.loadFields();
        this.showSuccess('Field deleted successfully');
      },
      error: (err) =>
        this.showError(err?.error?.message ?? 'Failed to delete field'),
    });
  }

  approveField(field: IField): void {
    this.fieldService.approveField(field.id).subscribe({
      next: () => {
        this.loadFields();
        this.showSuccess('Field approved');
      },
      error: () => this.showError('Error approving field'),
    });
  }

  rejectField(field: IField): void {
    this.fieldService.rejectField(field.id).subscribe({
      next: () => {
        this.loadFields();
        this.showSuccess('Field rejected');
      },
      error: () => this.showError('Error rejecting field'),
    });
  }

  downloadPdf(field: IField): void {
    window.open(
      `${this.fieldService['apiUrl']}/${field.id}/pdf`,
      '_blank'
    );
  }

  // ===== UI Helpers =====
  private showSuccess(message: string): void {
    this.snackBar.open(message, '×', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, '×', { duration: 4000 });
  }
}
