
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface TradeOrder {
  orderId: number;
  investorName: string;
  instrument: string;
  quantity: number;
  price: number;
  status: string;
}

@Component({
  selector: 'app-broker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './broker-dashboard.html',
  styleUrls: ['./broker-dashboard.css']
})
export class BrokerDashboard implements OnInit {
  orders: TradeOrder[] = [];
  loading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // Hardcoded data instead of service
  loadOrders(): void {
    this.orders = [
      { orderId: 1, investorName: 'John Doe', instrument: 'TCS', quantity: 100, price: 3500, status: 'PENDING' },
      { orderId: 2, investorName: 'Alice Smith', instrument: 'INFY', quantity: 50, price: 1450, status: 'EXECUTED' },
      { orderId: 3, investorName: 'Bob Johnson', instrument: 'RELIANCE', quantity: 200, price: 2500, status: 'PENDING' }
    ];
    this.loading = false;
  }

  approveOrder(orderId: number): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) order.status = 'EXECUTED';
  }

  rejectOrder(orderId: number): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) order.status = 'CANCELLED';
  }

  // ✅ Function to navigate to detail page
  goToOrderDetails(orderId: number): void {
    this.router.navigate(['/broker/orders', orderId]);
  }
}
