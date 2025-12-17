import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { WithdrawalService } from '../../services/withdrawal/withdrawal.service';
import { IWithdrawalHistory, IWithdrawalsResponse, WithdrawalStatus } from '../../Model/IWithdrawal/iwithdrawal';

@Component({
  selector: 'app-withdrawal-history',
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
  templateUrl: './withdrawal-history.html',
  styleUrls: ['./withdrawal-history.css'],
})
export class WithdrawalHistoryComponent {
  private readonly withdrawalService = inject(WithdrawalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly withdrawals = signal<IWithdrawalHistory[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly fieldId = signal<number | null>(null);
  page = signal(1);
  pageSize = signal(8);
  totalCount = signal(0);

   startIndex = computed(() => {
    return (this.page() - 1) * this.pageSize();
  });

  numberOfPages = computed(() => {
    return Math.ceil(this.totalCount() / this.pageSize());
  });

  displayedColumns: string[] = ['fieldName', 'amount', 'createdAt', 'status'];

  constructor() {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.fieldId.set(id);
        this.loadWithdrawalHistory();
      }
    });
    effect(() => this.loadWithdrawalHistory());
  }

  loadWithdrawalHistory(): void {
    const fieldId = this.fieldId();
    if (!fieldId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.withdrawalService
      .getWithdrawalHistory(fieldId, this.page(), this.pageSize())
      .subscribe({
        next: (data: IWithdrawalsResponse) => {
          this.withdrawals.set(data.withDrawHistories);
          this.totalCount.set(data.totalCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err?.error?.message || 'Failed to load withdrawal history');
        },
      });
  }

 goToPage(pageNumber: number) {
    this.page.set(pageNumber);
  }

  private normalizeStatus(value: any): WithdrawalStatus | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value as WithdrawalStatus;
    if (typeof value === 'string') {
      const v = value.toLowerCase();
      if (v === 'complete' || v === 'completed') return WithdrawalStatus.Complete;
      if (v === 'pending') return WithdrawalStatus.Pending;
      if (v === 'failed') return WithdrawalStatus.Failed;
      const asNumber = parseInt(value, 10);
      if (!isNaN(asNumber)) return asNumber as WithdrawalStatus;
    }
    return null;
  }

  getStatusLabel(status: any): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case WithdrawalStatus.Complete:
        return 'Complete';
      case WithdrawalStatus.Pending:
        return 'Pending';
      case WithdrawalStatus.Failed:
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: any): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case WithdrawalStatus.Complete:
        return 'primary';
      case WithdrawalStatus.Pending:
        return 'accent';
      case WithdrawalStatus.Failed:
        return 'warn';
      default:
        return '';
    }
  }

  goBack(): void {
    this.location.back();
  }
}
