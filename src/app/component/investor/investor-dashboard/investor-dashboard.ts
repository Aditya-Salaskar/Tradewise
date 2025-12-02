
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard implements OnInit {
  portfolioSummary: any;
  holdings: any[] = [];
  recentOrders: any[] = [];

  constructor(private dashboardService: InvestorDashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getPortfolioSummary().subscribe((summary: any) => {
      this.portfolioSummary = summary;
    });

    this.dashboardService.getHoldings().subscribe((data: any[]) => {
      this.holdings = data.slice(0, 5);
    });

    this.dashboardService.getOrders().subscribe((data: any[]) => {
           this.recentOrders = data.slice(0, 5);
    });
  }
}