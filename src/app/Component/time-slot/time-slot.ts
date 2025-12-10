import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal, effect, computed, inject, input } from '@angular/core';
import { TimeSlotService } from '../../services/time slot/time-slot-service';
import { Period } from '../../Model/ITimeSlot/day-schedule';
import { ITimeSlot } from '../../Model/ITimeSlot/itime-slot';
import { IField } from '../../Model/IField/ifield';

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


  selectedDate = signal<Date>(new Date());

  selectedPeriod = signal<Period>('Morning');
  dailySlots = signal<ITimeSlot[]>([]);
  isLoading = signal<boolean>(false);

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
    const hour = new Date(slot.startAtDateTime).getHours();
    return hour < 12;
  }

  private isAfternoonSlot(slot: ITimeSlot): boolean {
    const hour = new Date(slot.startAtDateTime).getHours();
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
          slotDate.getUTCFullYear() === selected.getFullYear() &&
          slotDate.getUTCMonth() === selected.getMonth() &&
          slotDate.getUTCDate() === selected.getDate();

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
    alert(`Attempting to book slot at ${slot.startAtDateTime}`);
  }
}
