
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard {
  portfolioSummary$: Observable<any>;
  holdings$: Observable<any[]>;
  recentOrders$: Observable<any[]>;

  constructor(private dashboardService: InvestorDashboardService) {
    this.portfolioSummary$ = this.dashboardService.getPortfolioSummary();

       this.holdings$ = this.dashboardService.getHoldings().pipe(
      map((data: any[]) => data.slice(0, 5)) // ✅ Top 5 holdings
    );

    this.recentOrders$ = this.dashboardService.getOrders().pipe(
      map((data: any[]) => data.slice(0, 5)) // ✅ Recent 5 orders
    );
  }
}