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
  private filterService = inject(FiltrationResultService); // === Signals ===

  fields = signal<IField[]>([]);
  loading = signal(true); // ملاحظة: يجب أن تتطابق أسماء هذه الـ Signals مع ما ترسله من ResultPageFilters

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
    // === جلب القيم الأولية من URL ===
    this.route.queryParams.subscribe((params) => {
      this.category.set(params['category'] || null);
      this.city.set(params['city'] || null);
      // يمكنك هنا إضافة جلب قيم أخرى مثل Search أو Size إذا كانت في الـ URL
    }); // === الـ Effect الذي يعمل عند تغيير أي Signal ===

    effect(() => {
      this.fetchResults();
    });
  }
  /**
   * دالة لجلب النتائج باستخدام جميع فلاتر الـ Signals، وإرسال null للقيم غير المحددة.
   */

  fetchResults() {
    const cat = this.category();
    const cty = this.city();
    const search = this.searchTerm() === '' ? null : this.searchTerm(); // إرسال null إذا كان حقل البحث فارغًا
    const sz = this.size();
    const min = this.minPrice();
    const max = this.maxPrice();
    const pg = this.page();
    const ps = this.pageSize();
    const isApproved = true; // نفترض أنها قيمة ثابتة للفلترة

    // إذا لم تكن هناك أي فلاتر (لا مدينة ولا فئة ولا بحث)، نوقف الجلب
    if (!cat && !cty && !search) {
      this.loading.set(false);
      this.fields.set([]);
      return;
    }

    this.loading.set(true);
    this.fields.set([]); // === استدعاء HomeFilter مع جميع المعلمات ===

    this.filterService
      .HomeFilter(cty, cat, search, sz, min, max, isApproved, pg, ps)
      .subscribe((res: IFieldResponse) => {
        this.fields.set(res.fields);
        this.loading.set(false);

        if (res.fields.length === 0) {
          this.noResultsMessage.set('لا توجد نتائج مطابقة للفلاتر');
          this.loading.set(false);
        } else {
          this.noResultsMessage.set(null);
        }
      });
  } // === دوال استقبال الأحداث من ResultPageFilters (كما هي) ===

  updateSearchTerm(value: string) {
    this.searchTerm.set(value);
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
