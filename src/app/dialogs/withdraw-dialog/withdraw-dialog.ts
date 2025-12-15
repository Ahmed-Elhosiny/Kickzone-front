import { Component, inject, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WithdrawalService } from '../../services/withdrawal/withdrawal.service';
import { IWithdrawRequest } from '../../Model/IWithdrawal/iwithdrawal';

export interface WithdrawDialogData {
  fieldId: number;
  fieldName: string;
  currentBalance: number;
}

@Component({
  selector: 'app-withdraw-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './withdraw-dialog.html',
  styleUrls: ['./withdraw-dialog.css'],
})
export class WithdrawDialogComponent {
  private readonly withdrawalService = inject(WithdrawalService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<WithdrawDialogComponent>);

  readonly isSubmitting = signal(false);
  amount: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: WithdrawDialogData) {}

  onSubmit(): void {
    if (this.amount <= 0) {
      this.snackBar.open('Please enter a valid amount', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (this.amount > this.data.currentBalance) {
      this.snackBar.open('Amount cannot exceed current balance', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isSubmitting.set(true);

    const request: IWithdrawRequest = {
      fieldId: this.data.fieldId,
      amount: this.amount,
    };

    this.withdrawalService.withdraw(request).subscribe({
      next: () => {
        this.snackBar.open('Withdrawal request submitted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMessage = err?.error?.message || 'Failed to submit withdrawal request';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
