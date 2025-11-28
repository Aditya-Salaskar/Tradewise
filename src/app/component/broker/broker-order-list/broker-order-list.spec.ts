import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerOrderList } from './broker-order-list';

describe('BrokerOrderList', () => {
  let component: BrokerOrderList;
  let fixture: ComponentFixture<BrokerOrderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrokerOrderList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrokerOrderList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
