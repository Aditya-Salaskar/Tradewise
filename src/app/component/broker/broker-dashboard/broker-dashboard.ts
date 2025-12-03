<<<<<<< HEAD

import { Component, ChangeDetectionStrategy } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> origin/Market-Data-Module
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import {
  Observable,
  combineLatest,
  BehaviorSubject,
  switchMap,
  map,
  catchError,
  of,
  shareReplay,
} from 'rxjs';

// ✅ Strong typing helps catch template mistakes
export interface Client {
  id: string;
  name: string;
  portfolioValue: number | string;
  todaysOrders: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Order {
  orderId: string;
  client: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number | string; // can be '₹1,000.50'
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}

export interface Stats {
  totalClients: number;
  activeOrders: number;
  todaysVolume: number;
}

@Component({
  selector: 'app-broker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './broker-dashboard.html',
  styleUrls: ['./broker-dashboard.css'],
  // ✅ OnPush plays nicely with async pipe & pure observables
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrokerDashboard {
  // Manual refresh trigger (e.g., after approve/reject or external refresh)
  private refresh$ = new BehaviorSubject<void>(undefined);

  // ✅ Streams from the service; re-fetch on refresh$
  clients$: Observable<Client[]> = this.refresh$.pipe(
    switchMap(() => this.dashboardService.getClients()),
    catchError(() => of([])), // ensure template never breaks
    shareReplay(1)
  );

  orders$: Observable<Order[]> = this.refresh$.pipe(
    switchMap(() => this.dashboardService.getOrders()),
    catchError(() => of([])),
    shareReplay(1)
  );

  // ✅ Derived stats stream
  stats$: Observable<Stats> = combineLatest([this.clients$, this.orders$]).pipe(
    map(([clients, orders]) => {
      const totalClients = clients.length;

      const activeOrders = orders.filter(
        (o) => o.status === 'PENDING' || o.status === 'EXECUTED'
      ).length;

      const todaysVolume = orders.reduce((sum, order) => {
        const q = Number(order.quantity) || 0;
        // Keep decimals; handle strings like "₹1,000.50"
        const p = Number(String(order.price).replace(/[^\d.]/g, '')) || 0;
        return sum + q * p;
      }, 0);

      return { totalClients, activeOrders, todaysVolume };
    }),
    shareReplay(1)
  );

  constructor(private router: Router, private dashboardService: DashboardService) {}

  // ---------- Actions ----------

  /** Navigate to order details */
  goToOrderDetails(orderId: string): void {
    this.router.navigate(['/broker/orders', orderId]);
  }

  /** Approve order: call service, then re-fetch streams */
  approveOrder(orderId: string): void {
    // If the service returns an Observable after updating the backend/mock store:
    this.dashboardService.approveOrder(orderId).subscribe({
      next: () => this.refresh$.next(), // re-fetch fresh data
      error: () => this.refresh$.next(), // still try to refresh to keep UI consistent
    });
  }

  /** Reject order: call service, then re-fetch streams */
  rejectOrder(orderId: string): void {
    this.dashboardService.rejectOrder(orderId).subscribe({
      next: () => this.refresh$.next(),
      error: () => this.refresh$.next(),
    });
  }

  // ---------- TrackBy for rendering performance ----------
  trackByClientId = (_: number, client: Client) => client.id;
  trackByOrderId = (_: number, order: Order) => order.orderId;
}
