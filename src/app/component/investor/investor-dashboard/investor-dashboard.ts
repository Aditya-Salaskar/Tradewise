import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InvestorDashboardService } from '../../../services/investor-dashboard.service';
import { Observable, of, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators'; // Added map and shareReplay
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

  // Data Observables
  recentOrders$: Observable<any[]> = of([]);
  calculatedTotalValue$: Observable<number> = of(0); // New Observable for the sum
  marketOverview$: Observable<any> = of(null);

  // Local data for the chart
  holdingsData: any[] = [];

  private investorID: string | null = null;
  private chartInstance: any;
  private holdingSubscription: Subscription | undefined;

  constructor(
    private dashboardService: InvestorDashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.role === 'investor' && currentUser.id) {
        this.investorID = currentUser.id;

        // 1. Fetch Recent Orders and share the result (so we don't call API twice)
        this.recentOrders$ = this.dashboardService.getRecentOrders(this.investorID, 5).pipe(
          shareReplay(1)
        );

        // 2. Calculate Total Value: Summation of (Price * Qty) of EXECUTED orders
        this.calculatedTotalValue$ = this.recentOrders$.pipe(
          map(orders => {
            if (!orders) return 0;
            return orders
              .filter(o => o.status === 'EXECUTED') // Filter only executed orders
              .reduce((total, order) => total + (order.price * order.quantity), 0); // Sum Logic
          })
        );

        // 3. Fetch Market Overview
        this.marketOverview$ = this.dashboardService.getMarketOverview();

        // 4. Fetch Holdings for Chart
        this.holdingSubscription = this.dashboardService.getTopHoldings(this.investorID, 5)
          .subscribe(data => {
            this.holdingsData = data;
            this.tryRenderChart();
          });
    }
  }

  ngAfterViewInit(): void {
    this.tryRenderChart();
  }

  tryRenderChart(): void {
    if (!this.holdingsData || this.holdingsData.length === 0 || !this.chartRef) {
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.holdingsData.map(h => h.symbol);
    const dataValues = this.holdingsData.map(h => h.value);

    // Deep Corporate Palette matching sidebar
    const colors = [
      '#1e3a8a', // Sidebar Dark Blue
      '#3b82f6', // Bright Blue
      '#60a5fa', // Light Blue
      '#93c5fd', // Pale Blue
      '#2563eb'  // Royal Blue
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
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 20,
              font: { family: 'Segoe UI', size: 12 },
              color: '#334155'
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
