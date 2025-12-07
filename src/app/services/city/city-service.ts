import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICity } from '../../Model/ICity/icity';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5184/api/Cities';

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
}
