import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { CategoryService } from '../../services/category/category-service';
import { CityService } from '../../services/city/city-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './filters.html',
  styleUrl: './filters.css',
})
export class Filters {
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private cityService = inject(CityService);

  categories$ = this.categoryService.GetAllCategories();
  cities$ = this.cityService.GetAllCities();

  // Selected values
  selectedCategoryId: number | null = null;
  selectedCityId: number | null = null;

  constructor() {}

  applyFilter() {
    if (this.selectedCategoryId && this.selectedCityId) {
      this.router.navigate(['/result'], {
        queryParams: { categoryId: this.selectedCategoryId, cityId: this.selectedCityId },
      });
    }
  }
}
