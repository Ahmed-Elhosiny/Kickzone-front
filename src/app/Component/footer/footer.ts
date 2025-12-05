import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, MatIconModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  companyEmail = 'kickzone.info.egypt@gmail.com';

  socialLinks = [
    { icon: 'facebook', url: 'https://facebook.com', label: 'Facebook' },
    { icon: 'mail', url: `mailto:${this.companyEmail}`, label: 'Email' },
    { icon: 'photo_camera', url: 'https://instagram.com', label: 'Instagram' },
  ];
}
