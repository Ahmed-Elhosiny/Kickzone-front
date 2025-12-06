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
  templateUrl: './HomeFilters.html',
  styleUrl: './filters.css',
})
export class HomeFilters {
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private cityService = inject(CityService);

  categories$ = this.categoryService.GetAllCategories();
  cities$ = this.cityService.GetAllCities();

  // Selected values
  selectedCategoryName: string | null = null;
  selectedCityName: string | null = null;

  constructor() {}

  applyFilter() {
    if (this.selectedCategoryName && this.selectedCityName) {
      this.router.navigate(['/result'], {
        queryParams: { city: this.selectedCityName, category: this.selectedCategoryName },
      });
    }
  }
}
