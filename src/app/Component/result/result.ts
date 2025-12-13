import { Component, inject, signal, effect } from '@angular/core';
import { FieldCard } from '../field-card/field-card';
import { ActivatedRoute } from '@angular/router';
import { IField } from '../../Model/IField/ifield';
import { IFieldResponse } from '../../Model/IField/ifield-response';
import { FiltrationResultService } from '../../services/Field/filtration-result';
import { ResultPageFilters } from '../result-page-filters/result-page-filters';

@Component({
  selector: 'app-result',
  imports: [FieldCard, ResultPageFilters],
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
})
export class Result {
  private route = inject(ActivatedRoute);
  private filterService = inject(FiltrationResultService);

  fields = signal<IField[]>([]);
  loading = signal(true);

  category = signal<string | null>(null);
  city = signal<string | null>(null);
  searchTerm = signal<string>('');
  size = signal<string | null>(null);
  minPrice = signal<number | null>(0);
  maxPrice = signal<number | null>(1000);
  page = signal<number>(1);
  pageSize = signal<number>(6);
  noResultsMessage = signal<string | null>(null);

  constructor() {

    this.route.queryParams.subscribe((params) => {
      this.category.set(params['category'] || null);
      this.city.set(params['city'] || null);

    });

    effect(() => {
      this.fetchResults();
    });
  }

  fetchResults() {
    const cat = this.category();
    const cty = this.city();
    const sz = this.size();
    const search = this.searchTerm() === '' ? null : this.searchTerm();
    const min = this.minPrice();
    const max = this.maxPrice();
    const pg = this.page();
    const ps = this.pageSize();
    const isApproved = true;

    this.loading.set(true);
    this.fields.set([]);
    this.noResultsMessage.set(null);

    this.filterService
      .HomeFilter(cty, cat, search, sz, min, max, isApproved, pg, ps)
      .subscribe({
        next: (res: IFieldResponse) => {
          this.fields.set(res.fields);
          this.loading.set(false);

          if (res.fields.length === 0) {
            this.noResultsMessage.set('No results found matching your criteria. Try adjusting your filters.');
          } else {
            this.noResultsMessage.set(null);
          }
        },
        error: (err) => {
          console.error('Failed to fetch fields:', err);
          this.loading.set(false);
          this.noResultsMessage.set('Failed to load fields. Please try again.');
        }
      });
  }

  updateSearchTerm(value: string) {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  updateCategory(value: string | null) {
    this.category.set(value);
    this.page.set(1);
  }

  updateCity(value: string | null) {
    this.city.set(value);
    this.page.set(1);
  }

  updateSize(values: string | null) {
    this.size.set(values);
    this.page.set(1);
  }

  updateMin(value: number | null) {
    this.minPrice.set(value);
    this.page.set(1);
  }

  updateMax(value: number | null) {
    this.maxPrice.set(value);
    this.page.set(1);
  }
}
