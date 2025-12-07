import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, OrderDisplay, ClientDisplay, DashboardStats } from '../../../services/dashboard.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

// ✅ Interface defines structure for the HTML to prevent 'unknown' errors
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

  // ✅ FIX: Variable name matches the HTML (*ngIf="dashboardData$ | async")
  dashboardData$!: Observable<DashboardViewData>;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
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

    // Combine streams into the single object expected by the template
    this.dashboardData$ = combineLatest([orders$, clients$, stats$]).pipe(
      map(([orders, clients, stats]) => ({
        orders,
        clients,
        stats
      }))
    );
  }

  approveOrder(orderId: string) {
    this.dashboardService.approveOrder(orderId).subscribe({
      next: () => this.refresh$.next(),
      error: (err: any) => console.error('Approve failed', err)
    });
  }

  rejectOrder(orderId: string) {
    this.dashboardService.rejectOrder(orderId).subscribe({
      next: () => this.refresh$.next(),
      error: (err: any) => console.error('Reject failed', err)
    });
  }

  // ✅ FIX: Add the specific method name your HTML is calling
  trackById(index: number, item: any) {
    return item.id || item.orderId;
  }
}
