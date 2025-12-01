
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard {
  portfolioSummary = {
    totalValue: 1250000,
    totalInvested: 1000000,
    totalGainLoss: 250000,
    gainLossPercent: 25
  };

  holdings = [
    { symbol: 'RELIANCE', quantity: 100, avgPrice: 2450, currentPrice: 2580, value: 258000 },
    { symbol: 'TCS', quantity: 50, avgPrice: 3200, currentPrice: 3450, value: 172500 },
    { symbol: 'INFY', quantity: 150, avgPrice: 1420, currentPrice: 1520, value: 228000 },
    { symbol: 'HDFC', quantity: 80, avgPrice: 2650, currentPrice: 2720, value: 217600 }
  ];

  
recentOrders = [
  { orderId: 'ORD-001', symbol: 'RELIANCE', type: 'BUY', quantity: 50, price: 2580, status: 'EXECUTED' },
  { orderId: 'ORD-002', symbol: 'TCS', type: 'SELL', quantity: 20, price: 3450, status: 'EXECUTED' },
  { orderId: 'ORD-003', symbol: 'INFY', type: 'BUY', quantity: 100, price: 1520, status: 'PENDING' },
  { orderId: 'ORD-004', symbol: 'HDFC', type: 'BUY', quantity: 30, price: 2720, status: 'EXECUTED' },
  { orderId: 'ORD-005', symbol: 'RELIANCE', type: 'SELL', quantity: 10, price: 2585, status: 'CANCELLED' }
];

}
