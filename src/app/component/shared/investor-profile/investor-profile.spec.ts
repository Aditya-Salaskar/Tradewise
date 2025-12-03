import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorProfile } from './investor-profile';

describe('InvestorProfile', () => {
  let component: InvestorProfile;
  let fixture: ComponentFixture<InvestorProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
