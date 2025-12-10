import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IField } from '../../Model/IField/ifield';
import { ICreateField, IUpdateField } from '../../Interfaces/ifield-dtos';

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

  // Create new field (multipart/form-data)
  createField(fieldData: ICreateField): Observable<IField> {
    const formData = new FormData();
    
    // Append basic field data
    formData.append('ownerId', fieldData.ownerId.toString());
    formData.append('categoryId', fieldData.categoryId.toString());
    formData.append('cityId', fieldData.cityId.toString());
    formData.append('name', fieldData.name);
    formData.append('location', fieldData.location);
    if (fieldData.locationLink) {
      formData.append('locationLink', fieldData.locationLink);
    }
    formData.append('pricePerHour', fieldData.pricePerHour.toString());
    formData.append('size', fieldData.size);
    formData.append('openAt', fieldData.openAt.toString());
    formData.append('closeAt', fieldData.closeAt.toString());
    
    // Append images
    fieldData.images.forEach((image, index) => {
      formData.append('images', image, image.name);
    });
    
    return this.http.post<IField>(this.apiUrl, formData);
  }

  // Update field (multipart/form-data)
  updateField(fieldData: IUpdateField): Observable<IField> {
    const formData = new FormData();
    
    // Append field data
    formData.append('id', fieldData.id.toString());
    formData.append('name', fieldData.name);
    formData.append('location', fieldData.location);
    if (fieldData.locationLink) {
      formData.append('locationLink', fieldData.locationLink);
    }
    if (fieldData.pricePerHour !== undefined) {
      formData.append('pricePerHour', fieldData.pricePerHour.toString());
    }
    if (fieldData.size) {
      formData.append('size', fieldData.size);
    }
    if (fieldData.openAt !== undefined) {
      formData.append('openAt', fieldData.openAt.toString());
    }
    if (fieldData.closeAt !== undefined) {
      formData.append('closeAt', fieldData.closeAt.toString());
    }
    
    // Append new images if any
    if (fieldData.newImages && fieldData.newImages.length > 0) {
      fieldData.newImages.forEach((image, index) => {
        formData.append('newImages', image, image.name);
      });
    }
    
    // Append image IDs to delete if any
    if (fieldData.deleteImageIds && fieldData.deleteImageIds.length > 0) {
      fieldData.deleteImageIds.forEach((id, index) => {
        formData.append('deleteImageIds', id.toString());
      });
    }
    
    return this.http.put<IField>(this.apiUrl, formData);
  }

  // Upload field document
  uploadFieldDocument(fieldId: number, document: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', document, document.name);
    
    return this.http.post(`${this.apiUrl}/${fieldId}/Document`, formData);
  }
}
