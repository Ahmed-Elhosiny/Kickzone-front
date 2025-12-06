// import { HttpClient, HttpParams } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { IFieldResponse } from '../../Model/IField/ifield-response';

// @Injectable({
//   providedIn: 'root',
// })
// export class FiltrationResult {
//   private baseUrl = 'http://localhost:5184/api/Fields/filtered';
//   private http = inject(HttpClient);

//   HomeFilter(FormCity: string, FormCategory: string, page = 1, pageSize = 6) {
//     const body = {
//       filters: {
//         searchTerm: '',
//         category: FormCategory,
//         city: FormCity,
//         size: '',
//         minPrice: 0,
//         maxPrice: 10000,
//         isApproved: true,
//       },
//     };

//     const params = new HttpParams()
//       .set('page', page.toString())
//       .set('pageSize', pageSize.toString());

//     return this.http.post<IFieldResponse>(this.baseUrl, body, { params });
//   }

//   ResultPageFilter(searchValue: string, sizeValue: string, minPrice: number,
//      maxPrice: number, isApproved: boolean, page = 1, pageSize = 6 ) {
//     const body = {
//       filters: {
//         searchTerm: searchValue,
//         category: '',
//         city: '',
//         size: sizeValue,
//         minPrice: minPrice,
//         maxPrice: maxPrice,
//         isApproved: true,
//       },
//     };
//   }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IFieldResponse } from '../../Model/IField/ifield-response';

@Injectable({
  providedIn: 'root',
})
export class FiltrationResultService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5184/api/Fields/filtered';

  HomeFilter(FormCity: string, FormCategory: string, page = 1, pageSize = 1000) {
    const body = {
      searchTerm: '',
      category: FormCategory,
      city: FormCity,
      size: null,
      minPrice: null,
      maxPrice: null,
      isApproved: true,
    };

    const params = new HttpParams().set('page', page).set('pageSize', pageSize);

    return this.http.post<IFieldResponse>(this.baseUrl, body, { params });
  }

  ResultPageFilter(
    searchValue: string,
    sizeValue: string[] | null,
    minPrice: number | null,
    maxPrice: number | null,
    isApproved: boolean | null,
    page = 1,
    pageSize = 1000
  ) {
    const body = {
      searchTerm: searchValue,
      category: '',
      city: '',
      size: sizeValue,
      minPrice: minPrice,
      maxPrice: maxPrice,
      isApproved: isApproved,
    };

    const params = new HttpParams().set('page', page).set('pageSize', pageSize);

    return this.http.post<IFieldResponse>(this.baseUrl, body, { params });
  }
}
