
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-broker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './broker-dashboard.html',
  styleUrls: ['./broker-dashboard.css']
})
export class BrokerDashboard implements OnInit {
  stats: any;
  clients: any[] = [];
  orders: any[] = [];
  loading = true;

  constructor(private router: Router, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(data => this.stats = data);
    this.dashboardService.getClients().subscribe(data => this.clients = data);
    this.dashboardService.getOrders().subscribe(data => {
      this.orders = data;
      this.loading = false;
    });
  }

  approveOrder(orderId: string): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) order.status = 'EXECUTED';
  }

  rejectOrder(orderId: string): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) order.status = 'CANCELLED';
  }

  goToOrderDetails(orderId: string): void {
    this.router.navigate(['/broker/orders', orderId]);
  }
}
