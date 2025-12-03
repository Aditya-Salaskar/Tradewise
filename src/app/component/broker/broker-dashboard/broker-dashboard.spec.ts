
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BrokerDashboard } from './broker-dashboard'; // ✅ correct import
import { DashboardService } from '../../../services/dashboard.service';
import { of } from 'rxjs';

describe('BrokerDashboard', () => {
  let fixture: ComponentFixture<BrokerDashboard>;
  let component: BrokerDashboard;

  // Mock service so the test doesn't hit the network
  const dashboardServiceMock = {
    getStats: () => of({ totalClients: 2, activeOrders: 1, todaysVolume: 123456 }),
    getClients: () => of([
      { id: 'CLI-001', name: 'Rajesh Kumar', status: 'ACTIVE', portfolioValue: 2500000, todaysOrders: 3 },
      { id: 'CLI-002', name: 'Priya Singh', status: 'ACTIVE', portfolioValue: 1800000, todaysOrders: 1 }
    ]),
    getOrders: () => of([
      { orderId: 'ORD-001', client: 'Rajesh Kumar', symbol: 'RELIANCE', type: 'BUY', quantity: 50, price: 2580, status: 'EXECUTED', executedAt: new Date().toISOString() },
      { orderId: 'ORD-002', client: 'Priya Singh', symbol: 'INFY', type: 'SELL', quantity: 10, price: 1500, status: 'PENDING', createdAt: new Date().toISOString() }
    ])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrokerDashboard,            // ✅ standalone component imported directly
        RouterTestingModule,        // optional, because component uses Router
        HttpClientTestingModule     // optional, avoids real HTTP if any slips through
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BrokerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render three stat cards with computed values', () => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;

    const cards = compiled.querySelectorAll('.stats .card');
    expect(cards.length).toBe(3); // Total Clients, Active Orders, Today's Volume

    expect(compiled.textContent).toContain('Total Clients');
    expect(compiled.textContent).toContain('Active Orders');
    expect(compiled.textContent).toContain("Today's Volume");

    // Basic value presence checks
    expect(compiled.textContent).toContain('2');       // totalClients from mock
    expect(compiled.textContent).toContain('1');       // activeOrders from mock
    // Volume will be formatted; just check the presence of currency symbol or number
    expect(compiled.textContent).toMatch(/₹|123456/);
  });

  it('should update order status on approve/reject', () => {
    // before
    const pending = component.orders.find(o => o.status === 'PENDING');
    expect(pending).toBeTruthy();
    const id = pending!.orderId;

    // approve
    component.approveOrder(id);
    const approved = component.orders.find(o => o.orderId === id);
    expect(approved?.status).toBe('EXECUTED');

    // reject (on a different id)
    const exec = component.orders.find(o => o.status === 'EXECUTED')!;
    component.rejectOrder(exec.orderId);
    const rejected = component.orders.find(o => o.orderId === exec.orderId);
    expect(rejected?.status).toBe('CANCELLED');
  });
});
