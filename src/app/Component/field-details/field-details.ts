import {
  Component,
  inject,
  signal,
  computed
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { catchError, of } from 'rxjs';

import { FieldService } from '../../services/Field/field-service';
import { IField } from '../../Model/IField/ifield';
import { TimeSlot } from '../time-slot/time-slot';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  UserContactInfoComponent,
  UserContactInfoDialogData
} from '../../dialogs/user-contact-info/user-contact-info';

type UiState = 'loading' | 'error' | 'ready';

@Component({
  selector: 'app-field-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    TimeSlot,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './field-details.html',
  styleUrl: './field-details.css',
})
export class FieldDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fieldService = inject(FieldService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // ================= STATE =================
  fieldId = signal<number>(0);
  field = signal<IField | null>(null);

  uiState = signal<UiState>('loading');
  errorMessage = signal('');

  selectedImageIndex = signal(0);

  // ================= COMPUTED =================
  hasImages = computed(() =>
    (this.field()?.fieldImages?.length ?? 0) > 0
  );

  currentImage = computed(() =>
    this.field()?.fieldImages?.[this.selectedImageIndex()]
  );

  // ================= INIT =================
  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id || id <= 0) {
        this.fail('Invalid field ID');
        return;
      }
      this.fieldId.set(id);
      this.loadField();
    });
  }

  // ================= DATA =================
  private loadField() {
    this.uiState.set('loading');

    this.fieldService.getFieldById(this.fieldId()).pipe(
      catchError(err => {
        this.fail(this.mapError(err));
        return of(null);
      })
    ).subscribe(field => {
      if (!field) return;

      this.field.set(field);
      this.selectedImageIndex.set(0);
      this.uiState.set('ready');
    });
  }

  private fail(message: string) {
    this.errorMessage.set(message);
    this.uiState.set('error');
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private mapError(err: any): string {
    if (err.status === 404) return 'Field not found';
    if (err.status === 0) return 'Server unreachable';
    return 'Failed to load field details';
  }

  // ================= UI ACTIONS =================
  goBack() {
    this.router.navigate(['/result']);
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  nextImage() {
    const images = this.field()?.fieldImages ?? [];
    this.selectedImageIndex.update(i => (i + 1) % images.length);
  }

  prevImage() {
    const images = this.field()?.fieldImages ?? [];
    this.selectedImageIndex.update(i =>
      i === 0 ? images.length - 1 : i - 1
    );
  }

  openMap() {
    const link = this.field()?.locationLink;
    if (link) {
      window.open(link, '_blank');
    }
  }

  openOwnerContact(event?: Event) {
    event?.stopPropagation();
    const f = this.field();
    if (!f) return;

    this.dialog.open(UserContactInfoComponent, {
      data: {
        userId: f.ownerId,
        username: f.ownerUserName
      } as UserContactInfoDialogData
    });
  }

  formatSize(size: string): string {
    const s = size.replace('Side_', '');
    return `${s} vs ${s}`;
  }
}
