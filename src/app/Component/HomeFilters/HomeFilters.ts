import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category/category-service';
import { CityService } from '../../services/city/city-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICategory } from '../../Model/ICategory/icategory';
import { ICity } from '../../Model/ICity/icity';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatTooltipModule
  ],
  templateUrl: './HomeFilters.html',
  styleUrl: './filters.css',
})
export class HomeFilters {
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly cityService = inject(CityService);

  // ===== Signals =====
  readonly categories = signal<ICategory[]>([]);
  readonly cities = signal<ICity[]>([]);
  readonly isLoadingCategories = signal(true);
  readonly isLoadingCities = signal(true);
  readonly selectedCategoryName = signal<string | null>(null);
  readonly selectedCityName = signal<string | null>(null);

  // ===== Computed Properties =====
  readonly isLoading = computed(() => 
    this.isLoadingCategories() || this.isLoadingCities()
  );

  readonly canSearch = computed(() => 
    this.selectedCategoryName() !== null && this.selectedCityName() !== null
  );

  readonly categoryCount = computed(() => this.categories().length);
  readonly cityCount = computed(() => this.cities().length);

  constructor() {
    this.loadCategories();
    this.loadCities();
  }

  // ===== Methods =====
  private loadCategories(): void {
    this.categoryService.GetAllCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoadingCategories.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoadingCategories.set(false);
      }
    });
  }

  private loadCities(): void {
    this.cityService.GetAllCities().subscribe({
      next: (data) => {
        this.cities.set(data);
        this.isLoadingCities.set(false);
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.isLoadingCities.set(false);
      }
    });
  }

  applyFilter(): void {
    const category = this.selectedCategoryName();
    const city = this.selectedCityName();
    
    if (category && city) {
      this.router.navigate(['/result'], {
        queryParams: { city, category },
      });
    }
  }

  clearFilters(): void {
    this.selectedCategoryName.set(null);
    this.selectedCityName.set(null);
  }
}
