import { Component, input, computed, signal } from '@angular/core';
import { IField } from '../../Model/IField/ifield';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-field-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './field-card.html',
  styleUrl: './field-card.css',
})
export class FieldCard {
  field = input<IField>();
  
  // ===== Signals =====
  readonly defaultImage = signal('assets/images/default-field.jpg');
  
  // ===== Computed Properties =====
  readonly fieldImage = computed(() => {
    const images = this.field()?.fieldImages;
    return images && images.length > 0 ? images[0].imageUrl : this.defaultImage();
  });
  
  readonly sizeLabel = computed(() => {
    const size = this.field()?.size;
    if (!size) return '';
    return size.replace('Side_', '') + ' vs ' + size.replace('Side_', '');
  });
  
  readonly operatingHours = computed(() => {
    const field = this.field();
    if (!field) return '';
    return `${this.formatTime(field.openAt)} - ${this.formatTime(field.closeAt)}`;
  });
  
  readonly isApproved = computed(() => this.field()?.isApproved === true);
  
  readonly priceFormatted = computed(() => {
    const price = this.field()?.pricePerHour;
    return price ? `${price.toFixed(0)} EGP` : 'N/A';
  });
  
  // ===== Methods =====
  private formatTime(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
}
