import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSlot } from './time-slot';

describe('TimeSlot', () => {
  let component: TimeSlot;
  let fixture: ComponentFixture<TimeSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSlot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
