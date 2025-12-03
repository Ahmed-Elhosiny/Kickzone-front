import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldCard } from './field-card';

describe('FieldCard', () => {
  let component: FieldCard;
  let fixture: ComponentFixture<FieldCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
