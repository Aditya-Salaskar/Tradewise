import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable, of, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Chart } from 'chart.js/auto';
 
@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-dashboard.html',
  styleUrls: ['./investor-dashboard.css']
})
export class InvestorDashboard implements OnInit, AfterViewInit, OnDestroy {
 
  @ViewChild('assetPieChart') chartRef!: ElementRef<HTMLCanvasElement>;
 
  portfolioSummary$: Observable<any> = of(null);
  recentOrders$: Observable<any[]> = of([]);
  marketOverview$: Observable<any> = of(null);
 
  // We hold data locally to ensure we can render chart when both View and Data are ready
  holdingsData: any[] = [];
 
  // store numeric investor id to match service signatures
  private investorID: number | null = null;
  private chartInstance: any;
  private holdingSubscription: Subscription | undefined;
 
  constructor(
    private dashboardService: InvestorDashboardService,
    private authService: AuthService
  ) {}
 
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
  if (currentUser && currentUser.role === 'investor' && currentUser.id) {
    // ensure investorID is a number (services expect number)
    this.investorID = Number(currentUser.id);

  // id can be number or string across services in this repo; cast to any to satisfy whichever signature
  const idForService: any = this.investorID !== null ? this.investorID : '';
  this.portfolioSummary$ = this.dashboardService.getPortfolioSummary(idForService);
  this.recentOrders$ = this.dashboardService.getRecentOrders(idForService, 5);
  this.marketOverview$ = this.dashboardService.getMarketOverview();
 
        // Fetch holdings and try to render chart immediately if view is ready
        this.holdingSubscription = this.dashboardService.getTopHoldings(idForService, 5)
          .subscribe(data => {
            this.holdingsData = data;
            this.tryRenderChart();
          });
    }
  }
 
  ngAfterViewInit(): void {
    // View is now ready, try rendering if data arrived first
    this.tryRenderChart();
  }
 
  tryRenderChart(): void {
    // Only render if we have Data AND the Canvas Element
    if (!this.holdingsData || this.holdingsData.length === 0 || !this.chartRef) {
      return;
    }
 
    // Destroy old chart if exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
 
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;
 
    const labels = this.holdingsData.map(h => h.symbol);
    const dataValues = this.holdingsData.map(h => h.value);
 
    // Aesthetic Fintech Blue Palette
    const colors = [
      '#0078d7', // Main Blue
      '#2b5c8a', // Dark Slate Blue
      '#50a5f1', // Light Blue
      '#34c38f', // Success Green (for contrast)
      '#f1b44c'  // Accent Yellow/Orange
    ];
 
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 15
        }]
      },
 
 
 
     
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // Thinner ring
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { family: 'Segoe UI', size: 12 }
            }
          }
        },
        layout: {
          padding: 10
        }
      }
    });
  }
 
 
  ngOnDestroy(): void {
    if (this.holdingSubscription) this.holdingSubscription.unsubscribe();
    if (this.chartInstance) this.chartInstance.destroy();
  }
}