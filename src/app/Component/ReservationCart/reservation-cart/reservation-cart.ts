import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICart } from '../../../Model/ICart/icart';
import { ReservationCartService } from '../../../services/ReservationCart/reservation-cart';
import { ICheckoutResponse } from '../../../Model/ICheckOut/icheckout-response';

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

  private cartService = inject(ReservationCartService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadCart();
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
        this.snackBar.open('❌ فشل تحميل عربة الحجوزات.', 'إغلاق', { duration: 3000 });
        this.loadingCart.set(false);
      },
    });
  }

  // addItemToCart(slotId: number): void {
  //   // يجب أن تكون هذه الدالة مرتبطة بزر "إضافة إلى العربة" في صفحة تفاصيل الفترة
  //   this.cartService.addItem(slotId).subscribe({
  //     next: (newCart) => {
  //       if (newCart) {
  //         this.cart = newCart;
  //         this.snackBar.open('✅ تمت إضافة الفترة بنجاح!', 'موافق', { duration: 2000 });
  //       } else {
  //         this.snackBar.open(
  //           '⚠️ لا يمكن إضافة الفترة (قد تكون محجوزة أو لديك حجز بالفعل في نفس الوقت).',
  //           'إغلاق',
  //           { duration: 5000 }
  //         );
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Failed to add item', err);
  //       this.snackBar.open('❌ فشل في إضافة الفترة.', 'إغلاق', { duration: 3000 });
  //     },
  //   });
  // }

  removeItemFromCart(slotId: number): void {
    this.cartService.removeItem(slotId).subscribe({
      next: (newCart) => {
        this.cart.set(newCart);
        this.snackBar.open('🗑️ تم إزالة الفترة بنجاح.', 'موافق', { duration: 2000 });
      },
      error: (err) => {
        console.error('Failed to remove item', err);
        this.snackBar.open('❌ فشل في إزالة الفترة.', 'إغلاق', { duration: 3000 });
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(() => this.loadCart());
  }

 

  checkout(): void {

    const currentCart = this.cart();

    if (!currentCart || currentCart.items.length === 0) {
      this.snackBar.open('🚫 لا يوجد عناصر في عربة الحجوزات لإتمام الدفع.', 'إغلاق', {
        duration: 3000,
      });
      return;
    }

    this.isCheckingOut.set(true);

    this.cartService.checkout().subscribe({
      next: (response: ICheckoutResponse) => {
        this.isCheckingOut.set(false);

        if (response.paymentUrl) {

          this.snackBar.open('💸 جاري تحويلك لبوابة الدفع...', 'موافق', { duration: 3000 });
          window.location.href = response.paymentUrl;
        } else {

          this.snackBar.open(`🎉 ${response.message}`, 'موافق', { duration: 5000 });
          this.cart.set({ userId: currentCart.userId, items: [] });
        }
      },
      error: (err) => {
        this.isCheckingOut.set(false);
        console.error('Checkout failed', err);
        this.snackBar.open('❌ فشل عملية الدفع. يرجى المحاولة مرة أخرى.', 'إغلاق', {
          duration: 5000,
        });
        this.loadCart();
      },
    });
  }

  totalPrice = computed<number>(() => {
  const currentCart = this.cart();
  if (!currentCart || !currentCart.items) {
    return 0;
  }

  return currentCart.items.reduce((sum, item) => sum + item.price, 0);
});
}
