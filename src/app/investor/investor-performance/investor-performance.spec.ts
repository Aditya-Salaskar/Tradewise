import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorPerformance } from './investor-performance';

describe('InvestorPerformance', () => {
  let component: InvestorPerformance;
  let fixture: ComponentFixture<InvestorPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorPerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorPerformance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
