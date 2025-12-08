
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrokerOrderService } from '../../../services/broker-order.service';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-broker-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './broker-order.html',
  styleUrls: ['./broker-order.css']
})
export class BrokerOrder implements OnInit {
  orders$!: Observable<any[]>;
  filteredOrders$!: Observable<any[]>;

  // Summary Observables
  totalToday$!: Observable<number>;
  pendingCount$!: Observable<number>;
  executedCount$!: Observable<number>;
  cancelledCount$!: Observable<number>;

  // Reactive Filters
  statusFilter$ = new BehaviorSubject<string>('');
  searchTerm$ = new BehaviorSubject<string>('');
  dateFrom$ = new BehaviorSubject<string | null>(null);
  dateTo$ = new BehaviorSubject<string | null>(null);

  // Template models for two-way binding (ensure ngModelChange emits string values)
  statusModel: string = '';
  searchModel: string = '';
  dateFromModel: string | null = null;
  dateToModel: string | null = null;

  constructor(private brokerOrderService: BrokerOrderService) {}

  ngOnInit(): void {
    // Fetch all orders
    this.orders$ = this.brokerOrderService.listAllOrders().pipe(
      map(data => (data || []).map(o => ({
        ...o,
        timestamp: o.timestamp ? new Date(o.timestamp) : new Date()
      })))
    );

    // Apply filters reactively
    this.filteredOrders$ = combineLatest([
      this.orders$,
      this.statusFilter$,
      this.searchTerm$,
      this.dateFrom$,
      this.dateTo$
    ]).pipe(
      map(([orders, status, search, from, to]) => {
        let list = [...orders];
        if (status) list = list.filter(o => o.status === status);
        if (search) {
          const q = search.trim().toLowerCase();
          list = list.filter(o =>
            (o.orderId || '').toLowerCase().includes(q) ||
            (o.instrument || '').toLowerCase().includes(q)
          );
        }
        if (from) list = list.filter(o => o.timestamp >= new Date(from));
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          list = list.filter(o => o.timestamp <= toDate);
        }
        return list.sort((a, b) => +b.timestamp - +a.timestamp);
      })
    );

    // Summary calculations
    this.totalToday$ = this.orders$.pipe(map(orders => {
      const todayStr = new Date().toDateString();
      return orders.filter(o => o.timestamp?.toDateString() === todayStr).length;
    }));
    this.pendingCount$ = this.orders$.pipe(map(orders => orders.filter(o => o.status === 'PENDING').length));
    this.executedCount$ = this.orders$.pipe(map(orders => orders.filter(o => o.status === 'EXECUTED').length));
    this.cancelledCount$ = this.orders$.pipe(map(orders => orders.filter(o => o.status === 'CANCELLED').length));
  }

  // Actions
  executeOrder(orderId: string) {
    this.brokerOrderService.updateOrderStatus(orderId, 'EXECUTED').subscribe(() => this.ngOnInit());
  }

  declineOrder(orderId: string) {
    this.brokerOrderService.updateOrderStatus(orderId, 'DECLINED').subscribe(() => this.ngOnInit());
  }

  formatDate(date: any): string {
    return date ? new Date(date).toLocaleString() : '';
  }
  
onStatusChange(value: string) {
  this.statusFilter$.next(value);
}

onSearchChange(value: string) {
  this.searchTerm$.next(value);
}

onDateFromChange(value: string) {
  this.dateFrom$.next(value);
}

onDateToChange(value: string) {
  this.dateTo$.next(value);
}

}
