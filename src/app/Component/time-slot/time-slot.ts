import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal, effect, computed, inject, input, DestroyRef } from '@angular/core';
import { TimeSlotService } from '../../services/time slot/time-slot-service';
import { Period } from '../../Model/ITimeSlot/day-schedule';
import { ITimeSlot } from '../../Model/ITimeSlot/itime-slot';
import { IField } from '../../Model/IField/ifield';
import { ReservationCartService } from '../../services/ReservationCart/reservation-cart';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SignalrService } from '../../services/signalr/signalr-service';

@Component({
  selector: 'app-time-slot',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './time-slot.html',
  styleUrl: './time-slot.css',
  providers: [TimeSlotService],
})
export class TimeSlot  {
  fieldSignal = input.required<IField>();
  private timeSlotService = inject(TimeSlotService);
  private cartService = inject(ReservationCartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private signalrService = inject(SignalrService);
  private destroyRef = inject(DestroyRef);

  selectedDate = signal<Date>(new Date());

  /*   selectedPeriod = signal<Period>('Morning'); */
  dailySlots = signal<ITimeSlot[]>([]);
  isLoading = signal<boolean>(false);
  isBooking = signal<boolean>(false);

  // trigger signal for updating time slots
  triggerUpdate = signal(0);

  constructor() {

    this.selectedDate.set(new Date());

    // Connect to real-time hub
    this.signalrService.startConnection();

    // Listen for updates
    this.signalrService.onSlotsUpdated(() => {
        this.triggerUpdate.update(n => n + 1);
    });

    this.destroyRef.onDestroy(() => {
      this.signalrService.stopConnection();
    });

    // Effect to fetch time slots when field or date changes

    effect(() => {
      this.triggerUpdate(); // depend on trigger
      const fieldId = this.fieldSignal().id;
      const date = this.selectedDate();

      if (fieldId && date) {
        const dateString = this.formatDateForApi(date);
        this.fetchTimeSlotsForDay(fieldId, dateString);
      }
    });
  }


  fetchTimeSlotsForDay(fieldId: number, dateString: string): void {
    this.isLoading.set(true);
    this.dailySlots.set([]);

    this.timeSlotService.getDateTimeSlots(fieldId, dateString).subscribe({
      next: (slots) => {
        console.log('Fetched slots for', dateString, slots);
        this.dailySlots.set(slots);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch daily slots', err.error);
        this.snackBar.open('Failed to load time slots: ' + err.error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        this.isLoading.set(false);
      },
    });
  }

  changeDay(offset: number): void {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() + offset);
    this.selectedDate.set(newDate);
  }

  /*   setPeriod(period: Period): void {
      this.selectedPeriod.set(period);
    } */

  /*   private isMorningSlot(slot: ITimeSlot): boolean {
      const hour = new Date(slot.startAtDateTime).getUTCHours();
      return hour < 12;
    }
  
    private isAfternoonSlot(slot: ITimeSlot): boolean {
      const hour = new Date(slot.startAtDateTime).getUTCHours();
      return hour >= 12;
    } */

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /*  filteredSlots = computed<ITimeSlot[]>(() => {
      const period = this.selectedPeriod(); 
     const selected = this.selectedDate();
 
     return this.dailySlots()
       .filter((slot) => {
         const slotDate = new Date(slot.startAtDateTime);
 
         const sameDay =
           slotDate.getFullYear() === selected.getFullYear() &&
           slotDate.getMonth() === selected.getMonth() &&
           slotDate.getDate() === selected.getDate();
 
         if (!sameDay) return false;
 
         return period === 'Morning' ? this.isMorningSlot(slot) : this.isAfternoonSlot(slot);
       })
       .sort(
         (a, b) => new Date(a.startAtDateTime).getTime() - new Date(b.startAtDateTime).getTime()
       );
   }); */

  getStartTime(slot: ITimeSlot): string {
    return new Date(slot.startAtDateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  bookTimeSlot(slot: ITimeSlot, available: boolean): void {

    if (this.isBooking()) {
      return;
    }

    this.isBooking.set(true);
    const slotId = slot.id;

    // try adding to cart
    if (available) {

      this.cartService.addItem(slotId).subscribe({
        next: (newCart) => {
          this.isBooking.set(false);
          if (newCart) {
            const snackBarRef = this.snackBar.open(
              `Slot at ${this.getStartTime(slot)} was added to cart!`,
              'Go to Cart',
              {
                duration: 8000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              }
            );


            snackBarRef.onAction().subscribe(() => {
              this.router.navigate(['/reservation-cart']);
            });

          } else {

            this.snackBar.open(
              'Unable to add slot to cart.',
              'Close',
              {
                duration: 7000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['warning-snackbar'],
              }
            );

            this.fetchTimeSlotsForDay(
              this.fieldSignal().id,
              this.formatDateForApi(this.selectedDate())
            );
          }
        },
        error: (err) => {
          this.isBooking.set(false);
          console.error('Failed to add item to cart', err);
          this.snackBar.open('Failed to add item to cart, ' + err.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });

    }

    // try removing from cart
    else {
      this.cartService.removeItem(slotId).subscribe({
        next: (newCart) => {
          this.isBooking.set(false);
          if (newCart) {
            const snackBarRef = this.snackBar.open(
              `Slot at ${this.getStartTime(slot)} was removed from cart!`,
              'Go to Cart',
              {
                duration: 8000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              }
            );


            snackBarRef.onAction().subscribe(() => {
              this.router.navigate(['/reservation-cart']);
            });

          } else {

            this.snackBar.open(
              'Unable to remove slot from cart.',
              'Close',
              {
                duration: 7000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['warning-snackbar'],
              }
            );

            this.fetchTimeSlotsForDay(
              this.fieldSignal().id,
              this.formatDateForApi(this.selectedDate())
            );
          }
        },
        error: (err) => {
          this.isBooking.set(false);
          console.error('Failed to remove item from cart', err);
          this.snackBar.open('Failed to remove item from cart, ' + err.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        }

      });
    }
  }
}
