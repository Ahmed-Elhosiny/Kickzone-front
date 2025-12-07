import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IFieldResponse } from '../../Model/IField/ifield-response';

@Injectable({
  providedIn: 'root',
})
export class FiltrationResultService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5184/api/Fields/filtered';

  HomeFilter(
    FormCity: string | null,
    FormCategory: string | null,
    searchValue: string | null,
    sizeValue: string| null,
    minPrice: number | null,
    maxPrice: number | null,
    isApproved: boolean | null,
    page = 1,
    pageSize = 1000
  ) {
    const body = {
      searchTerm: searchValue,
      category: FormCategory,
      city: FormCity,
      size: sizeValue,
      minPrice: minPrice,
      maxPrice: maxPrice,
      isApproved: isApproved,
    };

    const params = new HttpParams().set('page', page).set('pageSize', pageSize);

    return this.http.post<IFieldResponse>(this.baseUrl, body, { params });
  }
}
// ResultPageFilter(
//   searchValue: string,
//   sizeValue: string[] | null,
//   minPrice: number | null,
//   maxPrice: number | null,
//   isApproved: boolean | null,
//   page = 1,
//   pageSize = 1000
// ) {
//   const body = {
//     searchTerm: searchValue,
//     category: '',
//     city: '',
//     size: sizeValue,
//     minPrice: minPrice,
//     maxPrice: maxPrice,
//     isApproved: isApproved,
//   };

//   const params = new HttpParams().set('page', page).set('pageSize', pageSize);

//   return this.http.post<IFieldResponse>(this.baseUrl, body, { params });
// }
