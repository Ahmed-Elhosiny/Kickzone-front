import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { IField } from '../../Model/IField/ifield';
import { ICreateField, IUpdateField } from '../../Interfaces/ifield-dtos';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private readonly http = inject(HttpClient);

  // ✅ Keep apiUrl PUBLIC (readonly) because Admin uses it for PDF download
  readonly apiUrl = `${environment.apiUrl}/Fields`;

  // ==============================
  // GET
  // ==============================

  getAllFields(
    page: number = 1,
    pageSize: number = 1000
  ): Observable<IField[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<IField[]>(`${this.apiUrl}/all`, { params }).pipe(
      map(fields => this.transformFieldsResponse(fields))
    );
  }

  getFieldById(id: number): Observable<IField> {
    return this.http.get<IField>(`${this.apiUrl}/${id}`).pipe(
      map(field => this.transformFieldResponse(field))
    );
  }

  getFieldsByOwner(
    ownerId: number,
    page: number = 1,
    pageSize: number = 1000
  ): Observable<IField[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<IField[]>(
      `${this.apiUrl}/owner/${ownerId}`,
      { params }
    ).pipe(
      map(fields => this.transformFieldsResponse(fields))
    );
  }


  private transformFieldsResponse(fields: IField[]): IField[] {
    return fields.map(field => ({
      ...field,
      openAt: this.convertUtcHourToLocal(field.openAt),
      closeAt: this.convertUtcHourToLocal(field.closeAt)
    }));
  }

  private transformFieldResponse(field: IField): IField {
    return {
      ...field,
      openAt: this.convertUtcHourToLocal(field.openAt),
      closeAt: this.convertUtcHourToLocal(field.closeAt)
    };
  }

  private convertUtcHourToLocal(utcHour: number): number {
    // 1. Create a date object at 00:00 UTC today
    const date = new Date();
    date.setUTCHours(utcHour, 0, 0, 0);

    // 2. Get the hour in the user's local timezone
    return date.getHours();
  }

  private convertLocalHourToUtc(localHour: number): number {
    // 1. Create a date object at 00:00 local time today
    const date = new Date();
    date.setHours(localHour, 0, 0, 0);

    // 2. Get the hour in UTC timezone
    return date.getUTCHours();
  }



  getFieldPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  // ==============================
  // ADMIN ACTIONS
  // ==============================

  approveField(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectField(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, {});
  }

  // ==============================
  // DELETE
  // ==============================

  deleteField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==============================
  // CREATE / UPDATE
  // ==============================

  createField(fieldData: ICreateField): Observable<IField> {
    const formData = new FormData();

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
    formData.append('openAt', this.convertLocalHourToUtc(fieldData.openAt).toString());
    formData.append('closeAt', this.convertLocalHourToUtc(fieldData.closeAt).toString());

    fieldData.images.forEach((image) => {
      formData.append('images', image, image.name);
    });

    return this.http.post<IField>(this.apiUrl, formData);
  }

  updateField(fieldData: IUpdateField): Observable<IField> {
    const formData = new FormData();

    formData.append('id', fieldData.id.toString());
    formData.append('name', fieldData.name);
    formData.append('location', fieldData.location);

    if (fieldData.locationLink) {
      formData.append('locationLink', fieldData.locationLink);
    }

    if (fieldData.pricePerHour !== undefined) {
      formData.append(
        'pricePerHour',
        fieldData.pricePerHour.toString()
      );
    }

    if (fieldData.size) {
      formData.append('size', fieldData.size);
    }

    if (fieldData.openAt !== undefined) {
      formData.append('openAt', this.convertLocalHourToUtc(fieldData.openAt).toString());
    }

    if (fieldData.closeAt !== undefined) {
      formData.append('closeAt', this.convertLocalHourToUtc(fieldData.closeAt).toString());
    }

    if (fieldData.newImages?.length) {
      fieldData.newImages.forEach((image) => {
        formData.append('newImages', image, image.name);
      });
    }

    if (fieldData.deleteImageIds?.length) {
      fieldData.deleteImageIds.forEach((id) => {
        formData.append('deleteImageIds', id.toString());
      });
    }

    return this.http.put<IField>(this.apiUrl, formData);
  }

  // ==============================
  // DOCUMENT UPLOAD
  // ==============================

  uploadFieldDocument(
    fieldId: number,
    document: File
  ): Observable<HttpResponse<string>> {
    const formData = new FormData();
    formData.append('file', document, document.name);

    return this.http.post(
      `${this.apiUrl}/${fieldId}/Document`,
      formData,
      {
        observe: 'response',
        responseType: 'text',
      }
    );
  }
}
