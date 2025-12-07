import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorPortfolioPage } from './broker-investor-portfolio';

describe('InvestorPortfolioPage', () => {
  let component: InvestorPortfolioPage;
  let fixture: ComponentFixture<InvestorPortfolioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorPortfolioPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorPortfolioPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
