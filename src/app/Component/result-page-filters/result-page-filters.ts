import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-result-page-filters',
  imports: [],
  templateUrl: './result-page-filters.html',
  styleUrl: './result-page-filters.css',
})
export class ResultPageFilters {
  searchValue = output<string>();

  size = ['Side_2', 'Side_5', 'Side_6', 'Side_7', 'Side_11'];
  SelectedSize = output<string[] | null>();
  currentSizes: string[] = [];

  minPriceValue = signal<number | null>(0);
  maxPriceValue = signal<number | null>(1000);

  minPrice = output<number | null>();
  maxPrice = output<number | null>();

  updateSearchFilter(value: string) {
    this.searchValue.emit(value);
  }

  updateSizeFilter(value: string) {
    if (this.currentSizes.includes(value)) {
      this.currentSizes = this.currentSizes.filter((v) => v !== value);
    } else {
      this.currentSizes = [...this.currentSizes, value];
    }
    this.SelectedSize.emit(this.currentSizes);
  }

  updateMinPriceFilter(value: number) {
    this.minPriceValue.set(value);
    this.minPrice.emit(value);
  }

  updateMaxPriceFilter(value: number) {
    this.maxPriceValue.set(value);
    this.maxPrice.emit(value);
  }
}
