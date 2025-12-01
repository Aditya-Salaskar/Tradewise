import { TestBed } from '@angular/core/testing';

import { InvestorPortfolioService } from './investor-portfolio-service';

describe('InvestorPortfolioService', () => {
  let service: InvestorPortfolioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestorPortfolioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
