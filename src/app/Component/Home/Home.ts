import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../header/header';

@Component({
  selector: 'app-Home',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './Home.html',
  styleUrls: ['./Home.css'],
})
export class HomeComponent {
  // ===== Signals =====
  readonly missionImage = signal('/images/mission.jpg');
  readonly visionImage = signal('/images/vission.jpg');

  // ===== Mission & Vision Content =====
  readonly mission = signal({
    title: 'Our Mission',
    icon: 'sports_soccer',
    content: 'Our mission is to simplify how players organize matches, and book sports fields through a smart, user-friendly digital platform. We aim to make playing sports more accessible, organized, and enjoyable — helping communities stay active while supporting field owners with efficient booking management.'
  });

  readonly vision = signal({
    title: 'Our Vision',
    icon: 'visibility',
    content: 'Our vision is to become the leading platform for sports booking and community play — inspiring people to stay connected through sports, empowering local field owners, and building a vibrant network where every player finds their perfect game, anytime, anywhere.'
  });

  // ===== Features =====
  readonly features = signal([
    {
      icon: 'search',
      title: 'Easy Search',
      description: 'Find fields quickly by location, sport type, and availability'
    },
    {
      icon: 'schedule',
      title: 'Real-Time Booking',
      description: 'Book your preferred time slots instantly with live availability'
    },
    {
      icon: 'verified',
      title: 'Verified Venues',
      description: 'All fields are verified and meet quality standards'
    },
    {
      icon: 'groups',
      title: 'Community',
      description: 'Connect with players and build your sports community'
    }
  ]);
}
