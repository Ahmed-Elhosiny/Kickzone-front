import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../Model/ICategory/icategory';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5184/api/Categories';

  GetAllCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Failed to load categories:', error);
        return of([]);
      })
    );
  }

  GetCategoryById(id: number): Observable<ICategory | null> {
    return this.http.get<ICategory>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Failed to load category ${id}:`, error);
        return of(null);
      })
    );
  }
}
