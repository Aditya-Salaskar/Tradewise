import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorHoldings } from './investor-holdings';

describe('InvestorHoldings', () => {
  let component: InvestorHoldings;
  let fixture: ComponentFixture<InvestorHoldings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorHoldings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorHoldings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
