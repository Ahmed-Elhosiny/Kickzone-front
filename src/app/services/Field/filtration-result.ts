import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IFieldResponse } from '../../Model/IField/ifield-response';

@Injectable({
  providedIn: 'root',
})
export class FiltrationResultService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  HomeFilter(
    FormCity: string | null,
    FormCategory: string | null,
    searchValue: string | null,
    sizeValue: string | null,
    minPrice: number | null,
    maxPrice: number | null,
    isApproved: boolean | null,
    page = 1,
    pageSize = 1000
  ) {
    // Build request body matching backend FieldFiltersDto
    const body: any = {};
    
    if (searchValue) body.searchTerm = searchValue;
    if (FormCategory) body.category = FormCategory;
    if (FormCity) body.city = FormCity;
    if (sizeValue) body.size = sizeValue;
    if (minPrice !== null) body.minPrice = minPrice;
    if (maxPrice !== null) body.maxPrice = maxPrice;
    if (isApproved !== null) body.isApproved = isApproved;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.post<IFieldResponse>(`${this.apiUrl}/Fields/filtered`, body, { params });
  }
}

