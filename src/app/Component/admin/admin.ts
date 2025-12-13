import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CityService } from '../../services/city/city-service';
import { CategoryService } from '../../services/category/category-service';
import { FieldService } from '../../services/Field/field-service';
import { ICity } from '../../Model/ICity/icity';
import { ICategory } from '../../Model/ICategory/icategory';
import { IField } from '../../Model/IField/ifield';
import { MatDialog } from '@angular/material/dialog';
import { AddItemDialogComponent } from './../../dialogs/add-item/add-item';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class AdminPanelComponent implements OnInit {

  cities = signal<ICity[]>([]);
  categories = signal<ICategory[]>([]);
  fields = signal<IField[]>([]);

  private snackBar = inject(MatSnackBar);

  constructor(
    private cityService: CityService,
    private categoryService: CategoryService,
    private fieldService: FieldService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadCategories();
    this.loadFields();
  }

  loadCities() {
    this.cityService.GetAllCities().subscribe({
      next: data => this.cities.set(data),
      error: err => this.snackBar.open('Failed to load cities', '×', { duration: 4000 })
    });
  }

  loadCategories() {
    this.categoryService.GetAllCategories().subscribe({
      next: data => this.categories.set(data),
      error: err => this.snackBar.open('Failed to load categories', '×', { duration: 4000 })
    });
  }

  loadFields() {
    this.fieldService.getAllFields().subscribe({
      next: data => this.fields.set(data),
      error: err => this.snackBar.open('Failed to load fields', '×', { duration: 4000 })
    });
  }

  deleteCity(city: ICity) {
    if (city.fieldsCount > 0) {
      this.snackBar.open(`Cannot delete city "${city.name}" because it has fields`, '×', { duration: 4000 });
      return;
    }
    this.cityService.deleteCity(city.id).subscribe({
      next: () => this.loadCities(),
      error: err => this.snackBar.open(err.error.message, '×', { duration: 4000 })
    });
  }

  deleteCategory(category: ICategory) {
    if (category.fieldsCount > 0) {
      this.snackBar.open(`Cannot delete category "${category.name}" because it has fields`, '×', { duration: 4000 });
      return;
    }
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => this.loadCategories(),
      error: err => this.snackBar.open(err.error.message, '×', { duration: 4000 })
    });
  }

  deleteField(field: IField) {
    this.fieldService.deleteField(field.id).subscribe({
      next: () => this.loadFields(),
      error: err => this.snackBar.open(err.error.message, '×', { duration: 4000 })
    });
  }

  approveField(field: IField) {
    this.fieldService.approveField(field.id).subscribe({
      next: () => this.loadFields(),
      error: err => this.snackBar.open('Error approving field', '×', { duration: 4000 })
    });
  }

  rejectField(field: IField) {
    this.fieldService.rejectField(field.id).subscribe({
      next: () => this.loadFields(),
      error: err => this.snackBar.open('Error rejecting field', '×', { duration: 4000 })
    });
  }

  openPdf(url: string) {
    // Open the stored PDF in a new tab
    window.open(url, '_blank');
  }

  downloadPdf(field: IField) {
    // Hit backend download endpoint for the field PDF
    const downloadUrl = `/api/Fields/${field.id}/pdf`;
    window.open(downloadUrl, '_blank');
  }
 addCity() {
  const dialogRef = this.dialog.open(AddItemDialogComponent, {
    width: '400px',
    data: { title: 'Add New City' }
  });

  dialogRef.afterClosed().subscribe(name => {
    if (!name) return;

    this.cityService.addCity({ name }).subscribe({
      next: () => {
        this.snackBar.open('City added successfully', '×', { duration: 3000 });
        this.loadCities();
      },
      error: () => {
        this.snackBar.open('Failed to add city', '×', { duration: 3000 });
      }
    });
  });
}


addCategory() {
  const dialogRef = this.dialog.open(AddItemDialogComponent, {
    width: '400px',
    data: { title: 'Add New Category' }
  });

  dialogRef.afterClosed().subscribe(name => {
    if (!name) return;

    this.categoryService.addCategory({ name }).subscribe({
      next: () => {
        this.snackBar.open('Category added successfully', '×', { duration: 3000 });
        this.loadCategories();
      },
      error: () => {
        this.snackBar.open('Failed to add category', '×', { duration: 3000 });
      }
    });
  });
}



}
