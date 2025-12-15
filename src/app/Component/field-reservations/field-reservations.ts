import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ReservationService } from '../../services/Reservation/reservation';
import { IGetReservationDto, ReservationStatus } from '../../Model/IReservation/ireservation-dto';

@Component({
  selector: 'app-field-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './field-reservations.html',
  styleUrls: ['./field-reservations.css'],
})
export class FieldReservationsComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly reservations = signal<IGetReservationDto[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly fieldId = signal<number | null>(null);

  displayedColumns: string[] = ['userName', 'slotStart', 'amountPaid', 'reservedAt', 'status'];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.fieldId.set(id);
        this.loadFieldReservations();
      }
    });
  }

  loadFieldReservations(): void {
    const fieldId = this.fieldId();
    if (!fieldId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.reservationService.getReservationsForMyField(fieldId).subscribe({
      next: (reservations: any[]) => {
        this.reservations.set(reservations);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message || 'Failed to load reservations');
      },
    });
  }

  private normalizeReservationStatus(value: any): ReservationStatus | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value as ReservationStatus;
    if (typeof value === 'string') {
      const v = value.toLowerCase();
      if (v === 'complete' || v === 'completed') return ReservationStatus.Complete;
      if (v === 'pending') return ReservationStatus.Pending;
      const asNumber = parseInt(value, 10);
      if (!isNaN(asNumber)) return asNumber as ReservationStatus;
    }
    return null;
  }

  getStatusLabel(status: any): string {
    const s = this.normalizeReservationStatus(status);
    switch (s) {
      case ReservationStatus.Complete:
        return 'Complete';
      case ReservationStatus.Pending:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: any): string {
    const s = this.normalizeReservationStatus(status);
    switch (s) {
      case ReservationStatus.Complete:
        return 'primary';
      case ReservationStatus.Pending:
        return 'accent';
      default:
        return '';
    }
  }

  goBack(): void {
    this.location.back();
  }
}
