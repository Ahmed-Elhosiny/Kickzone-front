import { CommonModule, DatePipe } from '@angular/common';
import { Component, signal, effect, computed, inject, input, DestroyRef } from '@angular/core';
import { TimeSlotService } from '../../services/time slot/time-slot-service';
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
  dailySlots = signal<ITimeSlot[]>([]);
  isLoading = signal<boolean>(false);
  isBooking = signal<boolean>(false);
  triggerUpdate = signal(0);

  constructor() {

    this.selectedDate.set(new Date());
    this.signalrService.startConnection();

    this.signalrService.onSlotsUpdated(() => {
        this.triggerUpdate.update(n => n + 1);
    });

    this.destroyRef.onDestroy(() => {
      this.signalrService.stopConnection();
    });

    effect(() => {
      this.triggerUpdate();
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
        this.dailySlots.set(slots);
        this.isLoading.set(false);
      },
      error: (err) => {
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

  private formatDateForApi(date: Date): string {
    return date.toString();
  }

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
          this.snackBar.open('Failed to add item to cart, ' + err.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });

    } else {

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

  displaySlots = computed(() => {
    const now = new Date();

    return this.dailySlots().filter(slot => {
      const slotDate = new Date(slot.startAtDateTime);

      const isDayFinished =
        slotDate.getFullYear() < now.getFullYear() ||
        (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() < now.getMonth()) ||
        (slotDate.getFullYear() === now.getFullYear() &&
         slotDate.getMonth() === now.getMonth() &&
         slotDate.getDate() < now.getDate());

      if (isDayFinished) return false;

      const isToday = slotDate.toDateString() === now.toDateString();
      if (isToday && slotDate <= now) return false;

      return true;
    });
  });

  hasPreviousDays = computed(() => {
  const now = new Date();

  return this.dailySlots().some(slot => {
    const slotDate = new Date(slot.startAtDateTime);

    const isBeforeToday =
      slotDate.getFullYear() < now.getFullYear() ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() < now.getMonth()) ||
      (slotDate.getFullYear() === now.getFullYear() &&
       slotDate.getMonth() === now.getMonth() &&
       slotDate.getDate() < now.getDate());

    return isBeforeToday;
  });
});

canGoPrevious = computed(() => {
  const today = new Date();
  const sel = this.selectedDate();
  return sel > today;
});




}
