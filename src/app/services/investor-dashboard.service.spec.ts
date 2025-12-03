import { TestBed } from '@angular/core/testing';

import { InvestorDashboardService } from './investor-dashboard.service';

describe('InvestorDashboardService', () => {
  let service: InvestorDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestorDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
