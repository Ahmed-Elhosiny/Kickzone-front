import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFilters } from "../HomeFilters/HomeFilters";
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
     /* HomeFilters */
    ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private readonly router = inject(Router);  
  // ===== Signals =====
  readonly heroTitle = signal('Find Your Perfect Field');
  readonly heroSubtitle = signal('Book sports pitches and courts across Egypt');
  readonly backgroundImage = signal('/images/Header4.jpg');
  
  // ===== Animated Text =====
  readonly highlightWords = signal(['Perfect', 'Dream', 'Ideal', 'Favorite']);
  readonly currentWordIndex = signal(0);
  
  constructor() {
    // Rotate highlighted words every 3 seconds
    setInterval(() => {
      this.currentWordIndex.update(i => 
        (i + 1) % this.highlightWords().length
      );
    }, 3000);
  }
  
  readonly currentHighlightWord = computed(() => 
    this.highlightWords()[this.currentWordIndex()]
  );

  navigateToFields() {
    this.router.navigate(['/result']);
  }

}
