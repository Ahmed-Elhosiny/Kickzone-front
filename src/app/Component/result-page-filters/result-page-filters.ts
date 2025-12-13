import { Component, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-result-page-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './result-page-filters.html',
  styleUrl: './result-page-filters.css',
})
export class ResultPageFilters {
  // ===== Outputs =====
  searchValue = output<string>();
  SelectedSize = output<string | null>();
  minPrice = output<number | null>();
  maxPrice = output<number | null>();

  // ===== Signals =====
  readonly searchText = signal<string>('');
  readonly selectedSize = signal<string | null>(null);
  readonly minPriceValue = signal<number>(0);
  readonly maxPriceValue = signal<number>(1000);

  readonly sizes = signal([
    { value: 'Side_2', label: '2 vs 2' },
    { value: 'Side_5', label: '5 vs 5' },
    { value: 'Side_6', label: '6 vs 6' },
    { value: 'Side_7', label: '7 vs 7' },
    { value: 'Side_11', label: '11 vs 11' }
  ]);

  // ===== Computed Properties =====
  readonly hasActiveFilters = computed(() => 
    this.searchText() !== '' || 
    this.selectedSize() !== null ||
    this.minPriceValue() !== 0 ||
    this.maxPriceValue() !== 1000
  );

  readonly priceRange = computed(() => 
    `${this.minPriceValue()} - ${this.maxPriceValue()} EGP`
  );

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchText()) count++;
    if (this.selectedSize()) count++;
    if (this.minPriceValue() !== 0 || this.maxPriceValue() !== 1000) count++;
    return count;
  });

  // ===== Methods =====
  updateSearchFilter(value: string): void {
    this.searchText.set(value);
    this.searchValue.emit(value);
  }

  updateSizeFilter(value: string | null): void {
    this.selectedSize.set(value);
    this.SelectedSize.emit(value);
  }

  updateMinPriceFilter(value: number): void {
    this.minPriceValue.set(value);
    this.minPrice.emit(value);
  }

  updateMaxPriceFilter(value: number): void {
    this.maxPriceValue.set(value);
    this.maxPrice.emit(value);
  }

  clearAllFilters(): void {
    this.searchText.set('');
    this.selectedSize.set(null);
    this.minPriceValue.set(0);
    this.maxPriceValue.set(1000);
    
    this.searchValue.emit('');
    this.SelectedSize.emit(null);
    this.minPrice.emit(0);
    this.maxPrice.emit(1000);
  }

  clearSizeFilter(): void {
    this.updateSizeFilter(null);
  }

  clearPriceFilter(): void {
    this.minPriceValue.set(0);
    this.maxPriceValue.set(1000);
    this.minPrice.emit(0);
    this.maxPrice.emit(1000);
  }
}
