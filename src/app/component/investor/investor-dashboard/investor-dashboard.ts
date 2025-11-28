import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvestorNav } from '../investor-nav/investor-nav';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, InvestorNav],
  templateUrl: './investor-dashboard.html',
  styleUrl: './investor-dashboard.css',
})
export class InvestorDashboard {
  constructor(private router: Router) {}

  // Portfolio Summary with realistic dummy data
  portfolioSummary = {
    totalValue: 1250000,
    totalInvested: 1000000,
    totalGainLoss: 250000,
    gainLossPercent: 25,
  };

  // Top holdings with dummy data 
  holdings = [
    { symbol: 'RELIANCE', quantity: 100, avgPrice: 2450, currentPrice: 2580, value: 258000 },
    { symbol: 'TCS', quantity: 50, avgPrice: 3200, currentPrice: 3450, value: 172500 },
    { symbol: 'INFY', quantity: 150, avgPrice: 1420, currentPrice: 1520, value: 228000 },
    { symbol: 'HDFC', quantity: 80, avgPrice: 2650, currentPrice: 2720, value: 217600 }
  ];

  // Recent orders with dummy data
  recentOrders = [
    { orderId: 'ORD-001', symbol: 'RELIANCE', type: 'BUY', quantity: 50, price: 2580, status: 'EXECUTED' },
    { orderId: 'ORD-002', symbol: 'TCS', type: 'SELL', quantity: 20, price: 3450, status: 'PENDING' },
    { orderId: 'ORD-003', symbol: 'INFY', type: 'BUY', quantity: 100, price: 1520, status: 'EXECUTED' },
    { orderId: 'ORD-004', symbol: 'HDFC', type: 'BUY', quantity: 30, price: 2720, status: 'EXECUTED' }
  ];

  // Keep older placeholder fields for compatibility
  investorName = 'Investor';
  lastLogin?: Date;
  portfolioValue = 1250000;
  dailyChange = 25000;
  totalReturn = 0.25;
  cashBalance = 125000;
  openOrdersCount = 1;
  alerts: any[] = [];
  performanceData: any[] = [];
  perfOneDay = 0.015;
  perfOneWeek = 0.085;
  perfOneMonth = 0.18;
  perfYTD = 0.25;
  transactions: any[] = [];

  // Navigation helper used by template quick links
  onNavigate(path: string) {
    // delegate navigation to app-level nav by navigating to routes directly
    const map: Record<string, string> = {
      investor: '/investor',
      portfolio: '/portfolio',
      orders: '/orders',
      trade: '/trade',
      'market-data': '/market',
      risk: '/risk',
    };
    const route = map[path] || path;
    this.router.navigate([route]);
  }

  // current active nav key for highlighting
  currentActive = 'investor';

  logout() {
    // placeholder logout: clear session and navigate back to landing
    // TODO: wire real auth logout
    this.router.navigate(['/']);
  }

  goProfile() {
    // placeholder profile navigation
    this.router.navigate(['/profile']);
  }
}
