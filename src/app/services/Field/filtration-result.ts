import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IFieldResponse } from '../../Model/IField/ifield-response';
import { map } from 'rxjs';

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
    isApproved: boolean | null=true, 
    page = 1,
    pageSize = 1000,
    time: string | null
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
    if (time) body.time = time;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.post<IFieldResponse>(`${this.apiUrl}/Fields/filtered`, body, { params }).pipe(
      // Transform openAt and closeAt from UTC to local time
      map(response => this.transformResponse(response))
      );
  }

  private transformResponse(response: IFieldResponse): IFieldResponse {
    return {
      ...response,
      fields: response.fields.map(field => ({
        ...field,
        openAt: this.convertUtcHourToLocal(field.openAt),
        closeAt: this.convertUtcHourToLocal(field.closeAt)
      }))
    };
  }

  private convertUtcHourToLocal(utcHour: number): number {
    // 1. Create a date object at 00:00 UTC today
    const date = new Date();
    date.setUTCHours(utcHour, 0, 0, 0);

    // 2. Get the hour in the user's local timezone
    return date.getHours(); 
  }

}

