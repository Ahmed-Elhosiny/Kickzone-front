import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeFilters } from './HomeFilters';

describe('Filters', () => {
  let component: HomeFilters;
  let fixture: ComponentFixture<HomeFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
