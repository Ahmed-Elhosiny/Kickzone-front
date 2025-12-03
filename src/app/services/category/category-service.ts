import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../Model/ICategory/icategory';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5184/api/Categories';

  GetAllCategories() {
    return this.http.get<ICategory[]>(this.apiUrl);
  }

  GetCategoryById(id: number) {
    return this.http.get<ICategory>(`${this.apiUrl}/${id}`);
  }
}
