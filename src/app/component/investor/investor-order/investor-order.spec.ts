import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorOrder } from './investor-order';

describe('InvestorOrder', () => {
  let component: InvestorOrder;
  let fixture: ComponentFixture<InvestorOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
