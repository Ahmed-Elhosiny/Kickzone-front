import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '../../services/Field/field-service';
import { IField } from '../../Model/IField/ifield';
import { CommonModule, CurrencyPipe, ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TimeSlot } from '../time-slot/time-slot';

@Component({
  selector: 'app-field-details',
  standalone: true,
  imports: [CurrencyPipe, CommonModule, TimeSlot],
  templateUrl: './field-details.html',
  styleUrl: './field-details.css',
})
export class FieldDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private fieldService = inject(FieldService);
  private sanitizer = inject(DomSanitizer);
  private scroller = inject(ViewportScroller);

  field = signal<IField | null>(null);
  fieldId = signal<number | null>(null);

  constructor() {
    effect(() => {
      const id = this.fieldId();

      if (id !== null) {
        console.log(`Effect triggered. Fetching field with ID: ${id}`);

        this.fieldService.getFieldById(id).subscribe((res) => {
          console.log('Field Data Received:', res);
          this.field.set(res);
        });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.fieldId.set(id);
      console.log('Route ID set to:', id);
    });
  }

  getSafeMapUrl(location: string, city: string): SafeResourceUrl {
    const address = `${location}, ${city}`;

    const googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
      address
    )}&output=embed`;
    // (Sanitization)
    return this.sanitizer.bypassSecurityTrustResourceUrl(googleMapsUrl);
  }

  scrollToMap(): void {
    this.scroller.scrollToAnchor('google-map');
  }
}
