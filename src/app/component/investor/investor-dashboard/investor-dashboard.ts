
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard {
  portfolioSummary$: Observable<any>;
  holdings$: Observable<any[]>;
  recentOrders$: Observable<any[]>;

  constructor(private dashboardService: InvestorDashboardService) {
    // ✅ Reactive streams using async pipe
    this.portfolioSummary$ = this.dashboardService.getPortfolioSummary();
     this.holdings$ = this.dashboardService.getHoldings().pipe(map(h => h.slice(0, 5)));
    this.recentOrders$ = this.dashboardService.getOrders().pipe(map(o => o.slice(0, 5)));
  }
}