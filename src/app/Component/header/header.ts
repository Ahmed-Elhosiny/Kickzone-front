import { Component } from '@angular/core';
import { Filters } from "../filters/filters";

@Component({
  selector: 'app-header',
  imports: [Filters],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
