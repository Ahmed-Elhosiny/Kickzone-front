import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IField } from '../../Model/IField/ifield';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Fields`;

  // Get all fields with pagination
  getAllFields(page: number = 1, pageSize: number = 1000): Observable<IField[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<IField[]>(`${this.apiUrl}/all`, { params });
  }

  // Get field by ID
  getFieldById(id: number): Observable<IField> {
    return this.http.get<IField>(`${this.apiUrl}/${id}`);
  }

  // Get fields by owner
  getFieldsByOwner(ownerId: number, page: number = 1, pageSize: number = 1000): Observable<IField[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<IField[]>(`${this.apiUrl}/owner/${ownerId}`, { params });
  }

  // Approve field (admin)
  approveField(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  // Reject field (admin)
  rejectField(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, {});
  }

  // Delete field
  deleteField(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get field PDF
  getFieldPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
