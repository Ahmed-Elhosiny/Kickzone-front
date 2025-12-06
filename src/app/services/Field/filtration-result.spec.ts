import { TestBed } from '@angular/core/testing';

import { FiltrationResult } from './filtration-result';

describe('FiltrationResult', () => {
  let service: FiltrationResult;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltrationResult);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
