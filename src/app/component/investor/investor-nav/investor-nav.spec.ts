import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorNav } from './investor-nav';

describe('InvestorNav', () => {
  let component: InvestorNav;
  let fixture: ComponentFixture<InvestorNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
