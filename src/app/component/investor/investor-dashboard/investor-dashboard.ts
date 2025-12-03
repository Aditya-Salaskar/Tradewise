
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable } from 'rxjs';

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
    this.holdings$ = this.dashboardService.getHoldings();
    this.recentOrders$ = this.dashboardService.getOrders();
   }

}