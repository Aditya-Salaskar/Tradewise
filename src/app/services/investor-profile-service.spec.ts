import { TestBed } from '@angular/core/testing';

import { InvestorProfileService } from './investor-profile-service';

describe('InvestorProfileService', () => {
  let service: InvestorProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestorProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
