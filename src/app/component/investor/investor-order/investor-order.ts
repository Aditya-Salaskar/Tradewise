import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-investor-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './investor-order.html',
  styleUrls: ['./investor-order.css']
})
export class InvestorOrder implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];

  // Summary
  totalToday = 0;
  totalMonth = 0;
  pendingCount = 0;
  executedCount = 0;
  cancelledCount = 0;

  // Filters
  statusFilter = '';
  instrumentFilter = '';
  searchTerm = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;

  loading = true;

  constructor(private router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.list().subscribe({
      next: (data: any[]) => {
        // orderService.list() already maps timestamp to Date; keep defensive mapping
        this.orders = (data || []).map(o => ({ ...o, timestamp: o.timestamp ? new Date(o.timestamp) : new Date() }));
        this.computeSummary();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.orders = [];
        this.computeSummary();
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  computeSummary(): void {
    const now = new Date();
    const todayStr = now.toDateString();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    this.totalToday = this.orders.filter(o => o.timestamp?.toDateString() === todayStr).length;
    this.totalMonth = this.orders.filter(o => o.timestamp?.getMonth() === thisMonth && o.timestamp?.getFullYear() === thisYear).length;
    this.pendingCount = this.orders.filter(o => o.status === 'PENDING').length;
    this.executedCount = this.orders.filter(o => o.status === 'EXECUTED').length;
    this.cancelledCount = this.orders.filter(o => o.status === 'CANCELLED').length;
  }

  applyFilters(): void {
    let list = [...this.orders];

    if (this.statusFilter) {
      list = list.filter(o => o.status === this.statusFilter);
    }

    if (this.instrumentFilter) {
      const q = this.instrumentFilter.trim().toLowerCase();
      list = list.filter(o => (o.instrument || '').toLowerCase().includes(q));
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
    this.filteredOrders = list;
  }

  confirmCancel(order: any): void {
    if (order.status !== 'PENDING') return;
    if (!confirm(`Cancel order ${order.orderId}?`)) return;

    this.orderService.cancelByOrderId(order.orderId).subscribe({
      next: (updated) => {
        // update local state
        const idx = this.orders.findIndex(o => o.orderId === order.orderId);
        if (idx !== -1) this.orders[idx].status = 'CANCELLED';
        this.computeSummary();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Cancel failed, updating locally as fallback', err);
        order.status = 'CANCELLED';
        this.computeSummary();
        this.applyFilters();
      }
    });
  }

  exportCSV(): void {
    const rows = [
      ['Order ID', 'Instrument', 'Order Type', 'Quantity', 'Price', 'Status', 'Timestamp']
    ];
    this.filteredOrders.forEach(o => {
      rows.push([
        o.orderId || '',
        o.instrument || '',
        o.type || '',
        String(o.quantity ?? ''),
        String(o.price ?? ''),
        o.status || '',
        this.formatDate(o.timestamp)
      ]);
    });
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPDF(): void {
    // simple approach: open printable window and call print (user can save as PDF)
    const cols = ['Order ID', 'Instrument', 'Type', 'Qty', 'Price', 'Status', 'Timestamp'];
    let html = `<html><head><title>Orders</title><style>
      table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px;font-size:12px}
      th{background:#f4f4f4}
    </style></head><body>`;
    html += `<h2>Order Export (${new Date().toLocaleString()})</h2>`;
    html += '<table><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    this.filteredOrders.forEach(o => {
      html += `<tr>
        <td>${o.orderId || ''}</td>
        <td>${o.instrument || ''}</td>
        <td>${o.type || ''}</td>
        <td>${o.quantity ?? ''}</td>
        <td>${o.price ?? ''}</td>
        <td>${o.status || ''}</td>
        <td>${this.formatDate(o.timestamp)}</td>
      </tr>`;
    });
    html += '</tbody></table></body></html>';

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
      alert('Popups blocked. Allow popups to export PDF.');
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString();
  }
}
