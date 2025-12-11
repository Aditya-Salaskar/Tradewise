import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, OrderDisplay, ClientDisplay, DashboardStats } from '../../../services/dashboard.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

interface DashboardViewData {
  orders: OrderDisplay[];
  clients: ClientDisplay[];
  stats: DashboardStats;
}

@Component({
  selector: 'app-broker-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broker-dashboard.html',
  styleUrls: ['./broker-dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrokerDashboard implements OnInit {
  private refresh$ = new BehaviorSubject<void>(undefined);

  dashboardData$!: Observable<DashboardViewData>;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    // When refresh$ emits, re-fetch all data
    const orders$ = this.refresh$.pipe(
      switchMap(() => this.dashboardService.getOrders()),
      shareReplay(1)
    );

    const clients$ = this.refresh$.pipe(
      switchMap(() => this.dashboardService.getClients()),
      shareReplay(1)
    );

    const stats$ = this.refresh$.pipe(
      switchMap(() => this.dashboardService.getStats()),
      shareReplay(1)
    );

    this.dashboardData$ = combineLatest([orders$, clients$, stats$]).pipe(
      map(([orders, clients, stats]) => ({ orders, clients, stats }))
    );
  }

  approveOrder(order: OrderDisplay) {
    // Calling approveOrder updates the DB, then we trigger refresh$.next()
    this.dashboardService.approveOrder(order.orderId).subscribe({
      next: () => {
        this.refresh$.next();
      },
      error: (err) => console.error('Approve failed', err)
    });
  }

  rejectOrder(order: OrderDisplay) {
    this.dashboardService.rejectOrder(order.orderId).subscribe({
      next: () => {
        this.refresh$.next();
      },
      error: (err) => console.error('Reject failed', err)
    });
  }

  trackById(index: number, item: any) {
    return item.orderId || item.id;
  }
}
