import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './Component/nav-bar/nav-bar';
import { FooterComponent } from './Component/footer/footer';

@Component({
  selector: 'app-root',
  imports: [NavBarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('KickZone_Project');
}
