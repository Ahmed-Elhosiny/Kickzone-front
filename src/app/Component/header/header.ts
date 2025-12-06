import { Component } from '@angular/core';
import { HomeFilters } from "../HomeFilters/HomeFilters";

@Component({
  selector: 'app-header',
  imports: [HomeFilters],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
