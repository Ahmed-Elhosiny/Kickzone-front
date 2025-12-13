import { TestBed } from '@angular/core/testing';

import { ReservationCart } from './reservation-cart';

describe('ReservationCart', () => {
  let service: ReservationCart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationCart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
