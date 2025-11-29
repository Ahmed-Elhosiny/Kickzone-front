import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './Component/nav-bar/nav-bar';
import { Header } from './Component/header/header';
import { Body } from "./Component/body/body";
import { Footer } from "./Component/footer/footer";

@Component({
  selector: 'app-root',
  imports: [NavBar, Header, Body, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('KickZone_Project');
}
