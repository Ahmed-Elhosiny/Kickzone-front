import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-edit-field.html',
  styleUrls: ['./add-edit-field.css']
})
export class AddEditFieldComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fieldService = inject(FieldService);
  private categoryService = inject(CategoryService);
  private cityService = inject(CityService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  fieldForm!: FormGroup;
  categories: ICategory[] = [];
  cities: ICity[] = [];
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  existingImages: any[] = [];
  deleteImageIds: number[] = [];
  isEditMode = false;
  fieldId: number | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

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
    this.loadCategories();
    this.loadCities();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.fieldId = +params['id'];
        this.loadFieldData(this.fieldId);
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

  loadCategories(): void {
    this.categoryService.GetAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadCities(): void {
    this.cityService.GetAllCities().subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: (err) => {
        console.error('Error loading cities:', err);
      }
    });
  }

  loadFieldData(id: number): void {
    this.fieldService.getFieldById(id).subscribe({
      next: (field: IField) => {
        this.fieldForm.patchValue({
          name: field.name,
          categoryId: field.categoryName,
          cityId: field.cityName,
          location: field.location,
          locationLink: field.locationLink,
          pricePerHour: field.pricePerHour,
          size: field.size,
          openAt: field.openAt,
          closeAt: field.closeAt
        });
        this.existingImages = field.fieldImages || [];
      },
      error: (err) => {
        console.error('Error loading field:', err);
        this.errorMessage = 'Failed to load field data';
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.selectedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviewUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeNewImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  markImageForDeletion(imageId: number): void {
    if (!this.deleteImageIds.includes(imageId)) {
      this.deleteImageIds.push(imageId);
    }
  }

  unmarkImageForDeletion(imageId: number): void {
    const index = this.deleteImageIds.indexOf(imageId);
    if (index > -1) {
      this.deleteImageIds.splice(index, 1);
    }
  }

  isMarkedForDeletion(imageId: number): boolean {
    return this.deleteImageIds.includes(imageId);
  }

  onSubmit(): void {
    if (this.fieldForm.invalid) {
      this.markFormGroupTouched(this.fieldForm);
      return;
    }

    if (!this.isEditMode && this.selectedImages.length === 0) {
      this.errorMessage = 'Please select at least one image';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'User not authenticated';
      this.isSubmitting = false;
      return;
    }

    if (this.isEditMode && this.fieldId) {
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
      images: this.selectedImages
    };

    this.fieldService.createField(fieldData).subscribe({
      next: (response) => {
        this.successMessage = 'Field created successfully! Pending approval.';
        setTimeout(() => {
          this.router.navigate(['/field-owner/my-fields']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating field:', err);
        this.errorMessage = err.error?.message || 'Failed to create field';
        this.isSubmitting = false;
      }
    });
  }

  updateField(): void {
    const updateData: IUpdateField = {
      id: this.fieldId!,
      name: this.fieldForm.value.name,
      location: this.fieldForm.value.location,
      locationLink: this.fieldForm.value.locationLink,
      pricePerHour: this.fieldForm.value.pricePerHour,
      size: this.fieldForm.value.size,
      openAt: this.fieldForm.value.openAt,
      closeAt: this.fieldForm.value.closeAt,
      newImages: this.selectedImages.length > 0 ? this.selectedImages : undefined,
      deleteImageIds: this.deleteImageIds.length > 0 ? this.deleteImageIds : undefined
    };

    this.fieldService.updateField(updateData).subscribe({
      next: (response) => {
        this.successMessage = 'Field updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/field-owner/my-fields']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating field:', err);
        this.errorMessage = err.error?.message || 'Failed to update field';
        this.isSubmitting = false;
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
