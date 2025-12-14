import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICart } from '../../../Model/ICart/icart';
import { ReservationCartService } from '../../../services/ReservationCart/reservation-cart';
import { ICheckoutResponse } from '../../../Model/ICheckOut/icheckout-response';
import { ReservationService } from '../../../services/Reservation/reservation';
import { IReservation } from '../../../Model/IReservation/ireservation';

@Component({
  selector: 'app-reservation-cart',
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './reservation-cart.html',
  styleUrl: './reservation-cart.css',
})
export class ReservationCart implements OnInit {
  cart = signal<ICart | null>(null);
  loadingCart = signal(true);
  isCheckingOut = signal(false);


  myReservations = signal<IReservation[]>([]);
  loadingReservations = signal(true);

  private cartService = inject(ReservationCartService);
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadCart();
    this.loadMyReservations();
  }

  loadCart(): void {
    this.loadingCart.set(true);
    this.cartService.getCart().subscribe({
      next: (data) => {
        const newCart: ICart = {
          ...data,
          items: data?.items ?? [],
        };
        this.cart.set(newCart);
        this.loadingCart.set(false);
      },
      error: (err) => {
        console.error('Failed to load cart', err);
        this.snackBar.open('فشل تحميل عربة الحجوزات.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        this.loadingCart.set(false);
      },
    });
  }


  loadMyReservations(): void {
    this.loadingReservations.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (res) => {
        this.myReservations.set(res);
        this.loadingReservations.set(false);
      },
      error: (err) => {
        console.error('Failed to load reservations', err);
        this.loadingReservations.set(false);
      },
    });
  }

  removeItemFromCart(slotId: number): void {
    this.cartService.removeItem(slotId).subscribe({
      next: (newCart) => {
        this.cart.set(newCart);
        this.snackBar.open('تم إزالة الفترة بنجاح.', 'موافق', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
      },
      error: (err) => {
        console.error('Failed to remove item', err);
        this.snackBar.open('فشل في إزالة الفترة.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(() => this.loadCart());
  }

 checkout(): void {
  const currentCart = this.cart();

  if (!currentCart || currentCart.items.length === 0) {
    this.snackBar.open('لا يوجد عناصر في عربة الحجوزات لإتمام الدفع.', 'إغلاق', { duration: 3000 });
    return;
  }

  this.isCheckingOut.set(true);

  this.cartService.checkout().subscribe({
    next: (response: ICheckoutResponse) => {
      this.isCheckingOut.set(false);

      if (response.paymentUrl) {
        this.snackBar.open('جاري تحويلك لبوابة الدفع...', 'موافق', { duration: 3000 });
        window.location.href = response.paymentUrl;
      } else {
        this.snackBar.open(response.message || 'تم إتمام الطلب بنجاح!', 'موافق', { duration: 5000 });

        this.cart.set({
          ...currentCart,
          items: currentCart.items.map(item => ({
            ...item,
            isConfirmed: true // تم الدفع
          }))
        });
      }
    },
    error: (err) => {
      this.isCheckingOut.set(false);
      console.error('Checkout failed', err);
      this.snackBar.open('فشل عملية الدفع. يرجى المحاولة مرة أخرى.', 'إغلاق', { duration: 5000 });
    }
  });
}


  totalPrice = computed<number>(() => {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items) {
      return 0;
    }
    return currentCart.items.reduce((sum, item) => sum + item.price, 0);
  });
  allItemsConfirmed(): boolean {
  const currentCart = this.cart();
  if (!currentCart || !currentCart.items) return false;

  return currentCart.items.every(item => item.isConfirmed);
}


}
