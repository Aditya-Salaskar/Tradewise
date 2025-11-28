import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentDetail } from './instrument-detail';

describe('InstrumentDetail', () => {
  let component: InstrumentDetail;
  let fixture: ComponentFixture<InstrumentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstrumentDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstrumentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
