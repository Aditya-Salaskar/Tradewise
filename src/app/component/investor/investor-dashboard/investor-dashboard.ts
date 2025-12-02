
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvestorService } from '../../../services/investor.service';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard implements OnInit {
  stats: any;
  holdings: any[] = [];
  recentOrders: any[] = [];
  newOrder = { orderId: '', symbol: '', type: 'BUY', quantity: 0, price: '', status: 'PENDING' };

  constructor(private router: Router, private investorService: InvestorService) {}

  ngOnInit(): void {
    this.investorService.getInvestorStats().subscribe(data => this.stats = data);
    this.investorService.getHoldings().subscribe(data => this.holdings = data);
    this.investorService.getOrders().subscribe(data => this.recentOrders = data);
  }

  addOrder(): void {
    this.investorService.addOrder(this.newOrder).subscribe(order => {
      this.recentOrders.push(order);
      this.newOrder = { orderId: '', symbol: '', type: 'BUY', quantity: 0, price: '', status: 'PENDING' };
    });
  }

  onNavigate(path: string) {
    const map: Record<string, string> = {
      investor: '/investor',
      portfolio: '/portfolio',
      orders: '/orders',
      trade: '/trade',
      'market-data': '/market',
      risk: '/risk',
    };
    this.router.navigate([map[path] || path]);
  }

  logout() {
    this.router.navigate(['/']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }
}
