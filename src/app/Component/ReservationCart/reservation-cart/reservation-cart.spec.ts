import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCart } from './reservation-cart';

describe('ReservationCart', () => {
  let component: ReservationCart;
  let fixture: ComponentFixture<ReservationCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationCart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
