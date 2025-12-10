import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityService } from '../../services/city/city-service';
import { CategoryService } from '../../services/category/category-service';
import { FieldService } from '../../services/Field/field-service';
import { ICity } from '../../Model/ICity/icity';
import { ICategory } from '../../Model/ICategory/icategory';
import { IField } from '../../Model/IField/ifield';

@Component({
  selector: 'app-admin-panel',
  standalone: true,  // 🔹 standalone component
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class AdminPanelComponent implements OnInit {

  cities = signal<ICity[]>([]);
  categories = signal<ICategory[]>([]);
  fields = signal<IField[]>([]);

  constructor(
    private cityService: CityService,
    private categoryService: CategoryService,
    private fieldService: FieldService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadCategories();
    this.loadFields();
  }

  loadCities() {
    this.cityService.GetAllCities().subscribe(data => this.cities.set(data));
  }

  loadCategories() {
    this.categoryService.GetAllCategories().subscribe(data => this.categories.set(data));
  }

  loadFields() {
    this.fieldService.getAllFields().subscribe(data => this.fields.set(data));
  }

  deleteCity(city: ICity) {
    if (city.fieldsCount === 0) {
    this.cityService.deleteCity(city.id).subscribe(() => this.loadCities());
  }
  }

  deleteCategory(category: ICategory) {
    if (category.fieldsCount === 0) {
    this.categoryService.deleteCategory(category.id).subscribe(() => this.loadCategories());
    }
  }

  deleteField(field: IField) {
    this.fieldService.deleteField(field.id).subscribe(() => this.loadFields());
  }

  approveField(field: IField) {
    this.fieldService.approveField(field.id).subscribe(() => this.loadFields());
  }

  rejectField(field: IField) {
    this.fieldService.rejectField(field.id).subscribe(() => this.loadFields());
  }
}
