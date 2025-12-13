import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { ICart } from '../../Model/ICart/icart';
import { ICheckoutResponse } from '../../Model/ICheckOut/icheckout-response';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationCartService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);


  private cartContent = signal<ICart | null>(null);


  cartItemIds = computed<number[]>(() => {
    return this.cartContent()?.items?.map((item) => item.timeSlotId) ?? [];
  });

  constructor() {}

  loadCartItems(): void {
    this.getCart().subscribe();
  }

  getCart(): Observable<ICart> {
    const url = `${this.apiUrl}/ReservationCart`;
    return this.http.get<ICart>(url).pipe(
      tap((cart) => {
        const newCart: ICart = {
          ...cart,
          items: cart?.items ?? [],
        };
        this.cartContent.set(newCart);
      }),
      catchError((err) => {
        console.error('Error fetching cart', err);
        return of({ userId: 0, items: [] } as ICart);
      })
    );
  }

  // 2. POST /api/ReservationCart/add/{slotId}

  // addtem(slotId: number): Observable<ICart | null> {
  //   const url = `${this.apiUrl}/ReservationCart/add/${slotId}`;
  //   return this.http.post<ICart | null>(url, {});
  // }

  addItem(slotId: number): Observable<ICart | null> {
    const url = `${this.apiUrl}/ReservationCart/add/${slotId}`;
    return this.http.post<ICart>(url, {}).pipe(
      tap((newCart) => {
        if (newCart) {
          this.cartContent.set(newCart);
        }
      }),
      catchError((err) => {
        console.error('Failed to add item to cart', err);
        return of(null);
      })
    );
  }

  // 3. DELETE /api/ReservationCart/remove/{slotId}

  // removeItem(slotId: number): Observable<ICart> {
  //   const url = `${this.apiUrl}/ReservationCart/remove/${slotId}`;
  //   return this.http.delete<ICart>(url);
  // }

  removeItem(slotId: number): Observable<ICart> {
    const url = `${this.apiUrl}/ReservationCart/remove/${slotId}`;
    return this.http.delete<ICart>(url).pipe(tap((newCart) => this.cartContent.set(newCart)));
  }
  // 4. DELETE /api/ReservationCart/clear

  // clearCart(): Observable<any> {
  //   const url = `${this.apiUrl}/ReservationCart/clear`;
  //   return this.http.delete(url);
  // }

  clearCart(): Observable<void> {
    const url = `${this.apiUrl}/ReservationCart/clear`;
    return this.http
      .delete<void>(url)
      .pipe(
        tap(() => this.cartContent.set({ userId: this.cartContent()?.userId ?? 0, items: [] }))
      );
  }

  // 5. POST /api/ReservationCart/checkout

  // checkout(): Observable<ICheckoutResponse> {
  //   const url = `${this.apiUrl}/ReservationCart/checkout`;
  //   return this.http.post<ICheckoutResponse>(url, {});
  // }

  checkout(): Observable<ICheckoutResponse> {
    const url = `${this.apiUrl}/ReservationCart/checkout`;
    return this.http.post<ICheckoutResponse>(url, {}).pipe(
      tap((response) => {
        if (!response.paymentUrl) {
          this.cartContent.set({
            userId: this.cartContent()?.userId ?? 0,
            items: [],
          });
        }
      })
    );
  }
}
