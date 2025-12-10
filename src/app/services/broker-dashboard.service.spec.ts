import { TestBed } from '@angular/core/testing';

import { BrokerDashboardService } from './broker-dashboard.service';

describe('BrokerDashboardService', () => {
  let service: BrokerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrokerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
