import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IWithdrawalHistory, IWithdrawRequest } from '../../Model/IWithdrawal/iwithdrawal';

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class WithdrawalService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getWithdrawalHistory(fieldId: number, page: number = 1, pageSize: number = 10): Observable<IWithdrawalHistory[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<IWithdrawalHistory[]>(
      `${this.apiUrl}/WithDrawHistory/${fieldId}`,
      { params }
    );
  }

  withdraw(request: IWithdrawRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/withdraw`, request, { 
      responseType: 'text' as 'json'
    });
  }
}
