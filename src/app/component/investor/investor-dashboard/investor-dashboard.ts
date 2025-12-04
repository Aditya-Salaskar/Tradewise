import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard implements AfterViewInit {
  portfolioSummary$: Observable<any>;
  holdings$: Observable<any[]>;
  recentOrders$: Observable<any[]>;
  marketOverview$: Observable<any>;

  private investorID = 1;

  constructor(private dashboardService: InvestorDashboardService) {
    this.portfolioSummary$ = this.dashboardService.getPortfolioSummary(this.investorID);
    this.holdings$ = this.dashboardService.getTopHoldings(this.investorID, 5);
    this.recentOrders$ = this.dashboardService.getRecentOrders(this.investorID, 5);
    this.marketOverview$ = this.dashboardService.getMarketOverview(); // new
  }

  ngAfterViewInit(): void {
    this.dashboardService.buildAssetPieChart('assetPieChart', this.investorID);
  }
}
