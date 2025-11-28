import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeEntry } from './trade-entry';

describe('TradeEntry', () => {
  let component: TradeEntry;
  let fixture: ComponentFixture<TradeEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
