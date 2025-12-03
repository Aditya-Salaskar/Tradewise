import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorLayout } from './investor-layout';

describe('InvestorLayout', () => {
  let component: InvestorLayout;
  let fixture: ComponentFixture<InvestorLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
