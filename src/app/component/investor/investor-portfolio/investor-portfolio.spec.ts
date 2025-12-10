import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorPortfolio } from './investor-portfolio';

describe('InvestorPortfolio', () => {
  let component: InvestorPortfolio;
  let fixture: ComponentFixture<InvestorPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorPortfolio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});