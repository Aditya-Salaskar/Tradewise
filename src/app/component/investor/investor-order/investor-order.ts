import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-investor-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './investor-order.html',
  styleUrls: ['./investor-order.css']
})
export class InvestorOrder implements OnInit {
  orders$!: Observable<any[]>;
  filteredOrders$!: Observable<any[]>;

  // Summary
  totalToday$!: Observable<number>;
  pendingCount$!: Observable<number>;
  executedCount$!: Observable<number>;
  cancelledCount$!: Observable<number>;

  // Filters
  statusFilter = '';
  searchTerm = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;

  constructor(private router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    this.orders$ = this.orderService.listOrders().pipe(
      map(data => (data || []).map(o => ({
        ...o,
        timestamp: o.timestamp ? new Date(o.timestamp) : new Date()
      })))
    );

    this.filteredOrders$ = this.orders$.pipe(
      map(orders => this.applyFilters(orders))
    );

    this.totalToday$ = this.orders$.pipe(map(orders => {
      const todayStr = new Date().toDateString();
      return orders.filter(o => o.timestamp?.toDateString() === todayStr).length;
    }));
    this.pendingCount$ = this.orders$.pipe(map(orders => orders.filter(o => o.status === 'PENDING').length));
    this.executedCount$ = this.orders$.pipe(map(orders => orders.filter(o => o.status === 'EXECUTED').length));
    this.cancelledCount$ = this.orders$.pipe(map(orders => orders.filter(o => o.status === 'CANCELLED').length));
  }

  applyFilters(orders: any[]): any[] {
    let list = [...orders];
    if (this.statusFilter) {
      list = list.filter(o => o.status === this.statusFilter);
    }
    if (this.searchTerm) {
      const q = this.searchTerm.trim().toLowerCase();
      list = list.filter(o =>
        (o.orderId || '').toLowerCase().includes(q) ||
        (o.instrument || '').toLowerCase().includes(q)
      );
    }
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      list = list.filter(o => o.timestamp >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(o => o.timestamp <= to);
    }
    list.sort((a, b) => +b.timestamp - +a.timestamp);
    return list;
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString();
  }
}
