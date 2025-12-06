import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private http = inject(HttpClient);
  private apiUrl = '';
}
