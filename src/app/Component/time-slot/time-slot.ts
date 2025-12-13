import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal, effect, computed, inject, input } from '@angular/core';
import { TimeSlotService } from '../../services/time slot/time-slot-service';
import { Period } from '../../Model/ITimeSlot/day-schedule';
import { ITimeSlot } from '../../Model/ITimeSlot/itime-slot';
import { IField } from '../../Model/IField/ifield';
import { ReservationCartService } from '../../services/ReservationCart/reservation-cart';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-time-slot',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './time-slot.html',
  styleUrl: './time-slot.css',
  providers: [TimeSlotService],
})
export class TimeSlot implements OnInit {
  fieldSignal = input.required<IField>();
  private timeSlotService = inject(TimeSlotService);
  private cartService = inject(ReservationCartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  selectedDate = signal<Date>(new Date());

  selectedPeriod = signal<Period>('Morning');
  dailySlots = signal<ITimeSlot[]>([]);
  isLoading = signal<boolean>(false);
  isBooking = signal<boolean>(false);

  constructor() {
    effect(() => {
      const fieldId = this.fieldSignal().id;
      const date = this.selectedDate();

      if (fieldId && date) {
        const dateString = this.formatDateForApi(date);
        this.fetchTimeSlotsForDay(fieldId, dateString);
      }
    });
  }

  ngOnInit(): void {
    this.selectedDate.set(new Date());
  }

  fetchTimeSlotsForDay(fieldId: number, dateString: string): void {
    this.isLoading.set(true);
    this.dailySlots.set([]);

    this.timeSlotService.getAvailableTimeSlots(fieldId, dateString).subscribe({
      next: (slots) => {
        console.log('Fetched slots for', dateString, slots);
        this.dailySlots.set(slots);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch daily slots', err);
        this.isLoading.set(false);
      },
    });
  }

  changeDay(offset: number): void {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() + offset);
    this.selectedDate.set(newDate);
  }

  setPeriod(period: Period): void {
    this.selectedPeriod.set(period);
  }

  private isMorningSlot(slot: ITimeSlot): boolean {
    const hour = new Date(slot.startAtDateTime).getUTCHours();
    return hour < 12;
  }

  private isAfternoonSlot(slot: ITimeSlot): boolean {
    const hour = new Date(slot.startAtDateTime).getUTCHours();
    return hour >= 12;
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  filteredSlots = computed<ITimeSlot[]>(() => {
    const period = this.selectedPeriod();
    const selected = this.selectedDate();

    return this.dailySlots()
      .filter((slot) => {
        const slotDate = new Date(slot.startAtDateTime);

        const sameDay =
          // slotDate.getUTCFullYear() === selected.getFullYear() &&
          // slotDate.getUTCMonth() === selected.getMonth() &&
          // slotDate.getUTCDate() === selected.getDate();
          slotDate.getFullYear() === selected.getFullYear() &&
          slotDate.getMonth() === selected.getMonth() &&
          slotDate.getDate() === selected.getDate();

        if (!sameDay) return false;

        return period === 'Morning' ? this.isMorningSlot(slot) : this.isAfternoonSlot(slot);
      })
      .sort(
        (a, b) => new Date(a.startAtDateTime).getTime() - new Date(b.startAtDateTime).getTime()
      );
  });

  getStartTime(slot: ITimeSlot): string {
    return new Date(slot.startAtDateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  bookTimeSlot(slot: ITimeSlot): void {

    if (this.isBooking()) {
      return;
    }

    this.isBooking.set(true);
    const slotId = slot.id;

    this.cartService.addItem(slotId).subscribe({
      next: (newCart) => {
        this.isBooking.set(false);
        if (newCart) {
          const snackBarRef = this.snackBar.open(
            `تمت إضافة الفترة ${this.getStartTime(slot)} إلى عربة الحجوزات!`,
            'عرض العربة',
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


          this.dailySlots.update((slots) =>
            slots.map((s) => (s.id === slotId ? { ...s, isAvailable: false } : s))
          );
        } else {

          this.snackBar.open(
            'لا يمكن إضافة الفترة. قد تكون محجوزة للتو أو لديك تعارض.',
            'إغلاق',
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
        this.snackBar.open('فشل في إضافة الفترة. يرجى التأكد من تسجيل الدخول.', 'إغلاق', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
