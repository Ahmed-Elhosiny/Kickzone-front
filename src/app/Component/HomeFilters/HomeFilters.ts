import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category/category-service';
import { CityService } from '../../services/city/city-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ICategory } from '../../Model/ICategory/icategory';
import { ICity } from '../../Model/ICity/icity';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './HomeFilters.html',
  styleUrl: './filters.css',
})
export class HomeFilters {
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private cityService = inject(CityService);

  categories = signal<ICategory[]>([]);
  cities = signal<ICity[]>([]);

  // Selected values
  selectedCategoryName: string | null = null;
  selectedCityName: string | null = null;

  constructor() {
    this.categoryService.GetAllCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories:', err)
    });

    this.cityService.GetAllCities().subscribe({
      next: (data) => this.cities.set(data),
      error: (err) => console.error('Error loading cities:', err)
    });
  }

  applyFilter() {
    if (this.selectedCategoryName && this.selectedCityName) {
      this.router.navigate(['/result'], {
        queryParams: { city: this.selectedCityName, category: this.selectedCategoryName },
      });
    }
  }
}
