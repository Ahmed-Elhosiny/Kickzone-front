import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../Model/ICategory/icategory';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Categories`;

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
  deleteCategory(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
addCategory(category: { name: string }): Observable<ICategory> {
    return this.http.post<ICategory>(this.apiUrl, category).pipe(
      catchError((error) => {
        console.error('Failed to add category:', error);
        return of({ id: 0, name: category.name, fieldsCount: 0 } as ICategory);
      })
    );
  }
}
