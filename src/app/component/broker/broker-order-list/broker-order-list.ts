
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Client {
  clientId: string;
  name: string;
  portfolioValue: string;
  todaysOrders: number;
  status: string;
}

interface Order {
  orderId: string;
  client: string;
  symbol: string;
  type: string;
  quantity: number;
  price: string;
  status: string;
}

@Component({
  selector: 'app-broker-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './broker-order-list.html',
  styleUrls: ['./broker-order-list.css']
})
export class BrokerOrderList implements OnInit {
  clients: Client[] = [];
  orders: Order[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  // ✅ Hardcoded data
  loadData(): void {
    
this.clients = [
  { clientId: 'CLI-001', name: 'Rajesh Kumar', portfolioValue: '₹25,00,000', todaysOrders: 3, status: 'PENDING' },
  { clientId: 'CLI-002', name: 'Priya Singh', portfolioValue: '₹18,00,000', todaysOrders: 1, status: 'PENDING' },
  { clientId: 'CLI-003', name: 'Amit Patel', portfolioValue: '₹32,00,000', todaysOrders: 5, status: 'PENDING' },
  { clientId: 'CLI-004', name: 'Sneha Sharma', portfolioValue: '₹9,50,000', todaysOrders: 0, status: 'PENDING' },
  { clientId: 'CLI-005', name: 'Vikram Mehta', portfolioValue: '₹15,00,000', todaysOrders: 2, status: 'PENDING' }
];


    this.orders = [
      { orderId: 'ORD-101', client: 'Rajesh Kumar', symbol: 'RELIANCE', type: 'BUY', quantity: 50, price: '₹2580', status: 'EXECUTED' },
      { orderId: 'ORD-102', client: 'Amit Patel', symbol: 'TCS', type: 'SELL', quantity: 30, price: '₹3450', status: 'PENDING' },
      { orderId: 'ORD-103', client: 'Priya Singh', symbol: 'INFY', type: 'BUY', quantity: 100, price: '₹1520', status: 'EXECUTED' },
      { orderId: 'ORD-104', client: 'Vikram Mehta', symbol: 'HDFC', type: 'BUY', quantity: 40, price: '₹2720', status: 'PENDING' }
    ];
  }

  // ✅ Accept & Decline for Orders
  acceptOrder(orderId: string): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order && order.status === 'PENDING') {
      order.status = 'ACCEPTED';
    }
  }

  declineOrder(orderId: string): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order && order.status === 'PENDING') {
      order.status = 'DECLINED';
    }
  }

  // ✅ Accept & Decline for Clients
  acceptClient(clientId: string): void {
    const client = this.clients.find(c => c.clientId === clientId);
    if (client) client.status = 'ACTIVE';
  }

  declineClient(clientId: string): void {
    const client = this.clients.find(c => c.clientId === clientId);
    if (client) client.status = 'INACTIVE';
  }
}
