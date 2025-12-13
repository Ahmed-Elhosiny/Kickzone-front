import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface AddItemDialogData {
  title: string;
  message?: string;
  isConfirmation?: boolean;
}

@Component({
  selector: 'app-add-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-item.html',
})
export class AddItemDialogComponent {
  name = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<AddItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddItemDialogData
  ) {}

  get isConfirmation(): boolean {
    return !!this.data.isConfirmation;
  }

  submit() {
    if (this.isConfirmation) {
      this.dialogRef.close(true);
    } else {
      if (this.name.invalid) return;
      this.dialogRef.close(this.name.value);
    }
  }
  
  cancel() {
    this.dialogRef.close(this.isConfirmation ? false : undefined);
  }
}
