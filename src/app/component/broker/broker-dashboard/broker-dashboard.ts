import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BrokerDashboardService } from '../../../services/broker-dashboard.service';

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

  // ⭐ Use the new service name
  constructor(private router: Router, private dashboardService: BrokerDashboardService) {}

  ngOnInit(): void {
    // ⭐ Changed to new service methods
    this.dashboardService.getStats().subscribe(data => this.stats = data);
    this.dashboardService.getClients().subscribe(data => this.clients = data);
    this.dashboardService.getOrders().subscribe(data => {
      this.orders = data;
      this.loading = false;
    });
  }

  // ⭐ Broker actions require updating the order status via the service
  // You will need a method in BrokerDashboardService called updateOrderStatus(orderId, status)

  // NOTE: For now, this is a local change. The API call needs to be implemented.
  approveOrder(orderId: string): void {
    // In a real app, call this.dashboardService.updateOrderStatus(orderId, 'EXECUTED').subscribe(...)
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) order.status = 'EXECUTED'; 
  }

  // NOTE: For now, this is a local change. The API call needs to be implemented.
  rejectOrder(orderId: string): void {
    // In a real app, call this.dashboardService.updateOrderStatus(orderId, 'REJECTED').subscribe(...)
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) order.status = 'REJECTED'; 
  }

  goToOrderDetails(orderId: string): void {
    this.router.navigate(['/broker/orders', orderId]);
  }

  // Helper to filter for pending orders to be displayed in a dedicated table (Optional)
  get pendingOrders(): any[] {
    return this.orders.filter(o => o.status === 'PENDING');
  }
}