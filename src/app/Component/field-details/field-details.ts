import { Component, inject, signal, effect, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldService } from '../../services/Field/field-service';
import { IField } from '../../Model/IField/ifield';
import { CommonModule, CurrencyPipe, ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TimeSlot } from '../time-slot/time-slot';
import { catchError, of, Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-field-details',
  standalone: true,
  imports: [
    CurrencyPipe, 
    CommonModule, 
    TimeSlot, 
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './field-details.html',
  styleUrl: './field-details.css',
})
export class FieldDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fieldService = inject(FieldService);
  private sanitizer = inject(DomSanitizer);
  private scroller = inject(ViewportScroller);
  private snackBar = inject(MatSnackBar);

  field = signal<IField | null>(null);
  fieldId = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  selectedImageIndex = signal<number>(0);
  
  private routeSubscription?: Subscription;
  
  // Computed values for better reactivity
  hasImages = computed(() => {
    const fieldData = this.field();
    return fieldData && fieldData.fieldImages && fieldData.fieldImages.length > 0;
  });

  currentImage = computed(() => {
    const fieldData = this.field();
    const index = this.selectedImageIndex();
    if (fieldData && fieldData.fieldImages && fieldData.fieldImages.length > 0) {
      return fieldData.fieldImages[index];
    }
    return null;
  });

  constructor() {
    effect(() => {
      const id = this.fieldId();

      if (id !== null) {
        this.isLoading.set(true);
        this.hasError.set(false);
        
        this.fieldService.getFieldById(id).pipe(
          catchError((error) => {
            console.error('Error fetching field:', error);
            this.hasError.set(true);
            this.isLoading.set(false);
            
            if (error.status === 404) {
              this.errorMessage.set('Field not found. It may have been removed.');
            } else if (error.status === 0) {
              this.errorMessage.set('Cannot connect to server. Please check your connection.');
            } else {
              this.errorMessage.set('Failed to load field details. Please try again.');
            }
            
            this.snackBar.open(this.errorMessage(), 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            
            return of(null);
          })
        ).subscribe((res) => {
          if (res) {
            this.field.set(res);
            this.selectedImageIndex.set(0);
          }
          this.isLoading.set(false);
        });
      }
    });
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (isNaN(id) || id <= 0) {
        this.hasError.set(true);
        this.errorMessage.set('Invalid field ID');
        this.isLoading.set(false);
        return;
      }
      this.fieldId.set(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  getSafeMapUrl(location: string, city: string): SafeResourceUrl {
    const address = `${location}, ${city}`;
    const googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
      address
    )}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(googleMapsUrl);
  }

  scrollToMap(): void {
    this.scroller.scrollToAnchor('google-map');
  }

  goBack(): void {
    this.router.navigate(['/result']);
  }

  selectImage(index: number): void {
    const fieldData = this.field();
    if (fieldData && fieldData.fieldImages && index >= 0 && index < fieldData.fieldImages.length) {
      this.selectedImageIndex.set(index);
    }
  }

  nextImage(): void {
    const fieldData = this.field();
    if (fieldData && fieldData.fieldImages && fieldData.fieldImages.length > 0) {
      const currentIndex = this.selectedImageIndex();
      const nextIndex = (currentIndex + 1) % fieldData.fieldImages.length;
      this.selectedImageIndex.set(nextIndex);
    }
  }

  previousImage(): void {
    const fieldData = this.field();
    if (fieldData && fieldData.fieldImages && fieldData.fieldImages.length > 0) {
      const currentIndex = this.selectedImageIndex();
      const previousIndex = currentIndex === 0 ? fieldData.fieldImages.length - 1 : currentIndex - 1;
      this.selectedImageIndex.set(previousIndex);
    }
  }

  formatSize(size: string): string {
    return size.replace('Side_', '') + ' vs ' + size.replace('Side_', '');
  }

  openMapInNewTab(): void {
    const fieldData = this.field();
    if (fieldData) {
      const address = `${fieldData.location}, ${fieldData.cityName}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  }
}
