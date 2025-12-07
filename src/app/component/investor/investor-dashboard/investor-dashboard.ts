import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service'; // ⭐ Import AuthService

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard implements OnInit, AfterViewInit { // ⭐ Implement OnInit
  portfolioSummary$: Observable<any> = of(null);
  holdings$: Observable<any[]> = of([]);
  recentOrders$: Observable<any[]> = of([]);
  marketOverview$: Observable<any> = of(null);

  private investorID: string | null = null;

  constructor(
    private dashboardService: InvestorDashboardService,
    private authService: AuthService // ⭐ Inject AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.role === 'investor' && currentUser.id) {
        this.investorID = currentUser.id;
        
        // Initialize Observables using the dynamically determined investorID
        this.portfolioSummary$ = this.dashboardService.getPortfolioSummary(this.investorID);
        this.holdings$ = this.dashboardService.getTopHoldings(this.investorID, 5);
        this.recentOrders$ = this.dashboardService.getRecentOrders(this.investorID, 5);
        this.marketOverview$ = this.dashboardService.getMarketOverview();
    } else {
        // Handle case where user is not logged in or is not an investor
        console.error('User not logged in as investor.');
    }
  }

  ngAfterViewInit(): void {
    if (this.investorID) {
      // ⭐ Pass the retrieved investorID
      this.dashboardService.buildAssetPieChart('assetPieChart', this.investorID);
    }
  }
}