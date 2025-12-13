import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { FieldService } from '../../services/Field/field-service';
import { CategoryService } from '../../services/category/category-service';
import { CityService } from '../../services/city/city-service';
import { AuthService } from '../../auth/auth';
import { ICategory } from '../../Model/ICategory/icategory';
import { ICity } from '../../Model/ICity/icity';
import { ICreateField, IUpdateField } from '../../Interfaces/ifield-dtos';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-add-edit-field',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-edit-field.html',
  styleUrls: ['./add-edit-field.css']
})
export class AddEditFieldComponent implements OnInit {
  // ===== Injected Services =====
  private fb = inject(FormBuilder);
  private fieldService = inject(FieldService);
  private categoryService = inject(CategoryService);
  private cityService = inject(CityService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  // ===== Signals =====
  fieldForm!: FormGroup;
  categories = toSignal(this.categoryService.GetAllCategories(), { initialValue: [] as ICategory[] });
  cities = toSignal(this.cityService.GetAllCities(), { initialValue: [] as ICity[] });
  selectedImages = signal<File[]>([]);
  imagePreviewUrls = signal<string[]>([]);
  existingImages = signal<any[]>([]);
  deleteImageIds = signal<number[]>([]);
  isEditMode = signal(false);
  fieldId = signal<number | null>(null);
  isSubmitting = signal(false);
  isLoadingField = signal(false);

  fieldSizes = [
    { value: 'Side_2', label: '2 vs 2' },
    { value: 'Side_5', label: '5 vs 5' },
    { value: 'Side_6', label: '6 vs 6' },
    { value: 'Side_7', label: '7 vs 7' },
    { value: 'Side_11', label: '11 vs 11' }
  ];

  hours = Array.from({ length: 24 }, (_, i) => i);

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.fieldId.set(+params['id']);
        this.loadFieldData(this.fieldId()!);
      }
    });
  }

  initializeForm(): void {
    this.fieldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', Validators.required],
      cityId: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(5)]],
      locationLink: [''],
      pricePerHour: ['', [Validators.required, Validators.min(0)]],
      size: ['', Validators.required],
      openAt: ['', [Validators.required, Validators.min(0), Validators.max(23)]],
      closeAt: ['', [Validators.required, Validators.min(0), Validators.max(23)]]
    });
  }

  loadFieldData(id: number): void {
    this.isLoadingField.set(true);
    this.fieldService.getFieldById(id).subscribe({
      next: (field: IField) => {
        // Find category and city IDs by matching names
        const category = this.categories().find(c => c.name === field.categoryName);
        const city = this.cities().find(c => c.name === field.cityName);
        
        this.fieldForm.patchValue({
          name: field.name,
          categoryId: category?.id || '',
          cityId: city?.id || '',
          location: field.location,
          locationLink: field.locationLink || '',
          pricePerHour: field.pricePerHour,
          size: field.size,
          openAt: field.openAt,
          closeAt: field.closeAt
        });
        this.existingImages.set(field.fieldImages || []);
        this.isLoadingField.set(false);
      },
      error: (err) => {
        console.error('Error loading field:', err);
        this.isLoadingField.set(false);
        const errorMessage = err?.error?.message || 'Failed to load field data';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviewUrls.update(urls => [...urls, e.target.result]);
          };
          reader.readAsDataURL(file);
        }
      }
      
      this.selectedImages.update(images => [...images, ...newFiles]);
    }
  }

  removeNewImage(index: number): void {
    this.selectedImages.update(images => images.filter((_, i) => i !== index));
    this.imagePreviewUrls.update(urls => urls.filter((_, i) => i !== index));
  }

  markImageForDeletion(imageId: number): void {
    this.deleteImageIds.update(ids => 
      ids.includes(imageId) ? ids : [...ids, imageId]
    );
  }

  unmarkImageForDeletion(imageId: number): void {
    this.deleteImageIds.update(ids => ids.filter(id => id !== imageId));
  }

  isMarkedForDeletion(imageId: number): boolean {
    return this.deleteImageIds().includes(imageId);
  }

  onSubmit(): void {
    if (this.fieldForm.invalid) {
      this.markFormGroupTouched(this.fieldForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['warning-snackbar'],
      });
      return;
    }

    if (!this.isEditMode() && this.selectedImages().length === 0) {
      this.snackBar.open('Please select at least one image', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['warning-snackbar'],
      });
      return;
    }

    this.isSubmitting.set(true);

    const userId = this.authService.getUserId();
    if (!userId) {
      this.isSubmitting.set(false);
      this.snackBar.open('User not authenticated. Please login again.', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.router.navigate(['/login']);
      return;
    }

    if (this.isEditMode() && this.fieldId()) {
      this.updateField();
    } else {
      this.createField(userId);
    }
  }

  createField(ownerId: number): void {
    const fieldData: ICreateField = {
      ownerId: ownerId,
      categoryId: this.fieldForm.value.categoryId,
      cityId: this.fieldForm.value.cityId,
      name: this.fieldForm.value.name,
      location: this.fieldForm.value.location,
      locationLink: this.fieldForm.value.locationLink,
      pricePerHour: this.fieldForm.value.pricePerHour,
      size: this.fieldForm.value.size,
      openAt: this.fieldForm.value.openAt,
      closeAt: this.fieldForm.value.closeAt,
      images: this.selectedImages()
    };

    this.fieldService.createField(fieldData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Field created successfully! Pending approval.', 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        setTimeout(() => {
          this.router.navigate(['/field-owner/my-fields']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating field:', err);
        this.isSubmitting.set(false);
        const errorMessage = err?.error?.message || 'Failed to create field';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  updateField(): void {
    const updateData: IUpdateField = {
      id: this.fieldId()!,
      name: this.fieldForm.value.name,
      location: this.fieldForm.value.location,
      locationLink: this.fieldForm.value.locationLink,
      pricePerHour: this.fieldForm.value.pricePerHour,
      size: this.fieldForm.value.size,
      openAt: this.fieldForm.value.openAt,
      closeAt: this.fieldForm.value.closeAt,
      newImages: this.selectedImages().length > 0 ? this.selectedImages() : undefined,
      deleteImageIds: this.deleteImageIds().length > 0 ? this.deleteImageIds() : undefined
    };

    this.fieldService.updateField(updateData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Field updated successfully!', 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        setTimeout(() => {
          this.router.navigate(['/field-owner/my-fields']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating field:', err);
        this.isSubmitting.set(false);
        const errorMessage = err?.error?.message || 'Failed to update field';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get f() {
    return this.fieldForm.controls;
  }
}
