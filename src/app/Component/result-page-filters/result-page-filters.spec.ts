import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultPageFilters } from './result-page-filters';

describe('ResultPageFilters', () => {
  let component: ResultPageFilters;
  let fixture: ComponentFixture<ResultPageFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultPageFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultPageFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
