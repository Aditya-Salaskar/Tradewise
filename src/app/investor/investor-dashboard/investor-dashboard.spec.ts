import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorDashboard } from './investor-dashboard';

describe('InvestorDashboard', () => {
  let component: InvestorDashboard;
  let fixture: ComponentFixture<InvestorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
