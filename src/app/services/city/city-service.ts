import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICity } from '../../Model/ICity/icity';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Cities`;

  GetAllCities(): Observable<ICity[]> {
    return this.http.get<ICity[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Failed to load cities:', error);
        return of([]);
      })
    );
  }

  GetCityById(id: number): Observable<ICity | null> {
    return this.http.get<ICity>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Failed to load city ${id}:`, error);
        return of(null);
      })
    );
  }
  deleteCity(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
addCity(city: { name: string }): Observable<ICity> {
    return this.http.post<ICity>(this.apiUrl, city).pipe(
      catchError((error) => {
        console.error('Failed to add city:', error);
        return of({ id: 0, name: city.name, fieldsCount: 0 } as ICity);
      })
    );
  }
}
