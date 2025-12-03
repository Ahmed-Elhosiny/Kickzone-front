import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICity } from '../../Model/ICity/icity';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5184/api/Cities';

  GetAllCities() {
    return this.http.get<ICity[]>(this.apiUrl);
  }

  GetCityById(id: number) {
    return this.http.get<ICity>(`${this.apiUrl}/${id}`);
  }
}
