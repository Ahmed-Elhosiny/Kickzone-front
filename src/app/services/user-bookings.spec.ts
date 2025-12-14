import { TestBed } from '@angular/core/testing';

import { UserBookings } from './user-bookings';

describe('UserBookings', () => {
  let service: UserBookings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserBookings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
