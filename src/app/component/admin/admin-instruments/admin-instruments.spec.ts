import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInstruments } from './admin-instruments';

describe('AdminInstruments', () => {
  let component: AdminInstruments;
  let fixture: ComponentFixture<AdminInstruments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInstruments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInstruments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
