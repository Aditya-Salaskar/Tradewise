import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Observable, map, BehaviorSubject, combineLatest } from 'rxjs';

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

  // Filters (backed by subjects so changes trigger reactive recompute)
  private _statusFilter = '';
  private _searchTerm = '';
  private _dateFrom: string | null = null;
  private _dateTo: string | null = null;

  statusFilter$ = new BehaviorSubject<string>('');
  searchTerm$ = new BehaviorSubject<string>('');
  dateFrom$ = new BehaviorSubject<string | null>(null);
  dateTo$ = new BehaviorSubject<string | null>(null);

  // keep getters/setters so template two-way bindings continue to work
  get statusFilter() { return this._statusFilter; }
  set statusFilter(v: string) { this._statusFilter = v; this.statusFilter$.next(v); }

  get searchTerm() { return this._searchTerm; }
  set searchTerm(v: string) { this._searchTerm = v; this.searchTerm$.next(v); }

  get dateFrom() { return this._dateFrom; }
  set dateFrom(v: string | null) { this._dateFrom = v; this.dateFrom$.next(v); }

  get dateTo() { return this._dateTo; }
  set dateTo(v: string | null) { this._dateTo = v; this.dateTo$.next(v); }

  // Template models and handlers (explicitly emit values) — keeps template simple
  searchModel: string = '';
  statusModel: string = '';
  dateFromModel: string | null = null;
  dateToModel: string | null = null;

  onSearchChange(value: string) { this.searchTerm = value; }
  onStatusChange(value: string) { this.statusFilter = value; }
  onDateFromChange(value: string | null) { this.dateFrom = value; }
  onDateToChange(value: string | null) { this.dateTo = value; }

  constructor(private router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    this.orders$ = this.orderService.listOrders().pipe(
      map(data => (data || []).map(o => ({
        ...o,
        timestamp: o.timestamp ? new Date(o.timestamp) : new Date()
      })))
    );

    // Recompute filtered orders whenever orders or any filter changes
    this.filteredOrders$ = combineLatest([
      this.orders$,
      this.statusFilter$,
      this.searchTerm$,
      this.dateFrom$,
      this.dateTo$
    ]).pipe(
      map(([orders, status, search, from, to]) => {
        // set local primitive values so template bindings stay in sync
        this._statusFilter = status;
        this._searchTerm = search;
        this._dateFrom = from;
        this._dateTo = to;
        // apply filters
        let list = [...orders];
        if (status) list = list.filter(o => o.status === status);
        if (search) {
          const q = search.trim().toLowerCase();
          list = list.filter(o => (o.orderId || '').toLowerCase().includes(q) || (o.instrument || '').toLowerCase().includes(q));
        }
        if (from) {
          const fromDt = new Date(from);
          list = list.filter(o => o.timestamp >= fromDt);
        }
        if (to) {
          const toDt = new Date(to);
          toDt.setHours(23,59,59,999);
          list = list.filter(o => o.timestamp <= toDt);
        }
        list.sort((a,b) => +b.timestamp - +a.timestamp);
        return list;
      })
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
