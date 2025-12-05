import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorTrade } from './investor-trade';

describe('InvestorTrade', () => {
  let component: InvestorTrade;
  let fixture: ComponentFixture<InvestorTrade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorTrade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorTrade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
