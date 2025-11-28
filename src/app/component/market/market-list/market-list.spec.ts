import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketList } from './market-list';

describe('MarketList', () => {
  let component: MarketList;
  let fixture: ComponentFixture<MarketList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
