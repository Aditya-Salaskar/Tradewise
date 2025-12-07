import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Services
import { DashboardService } from '../../../services/dashboard.service';
import { RiskService, RiskMetric } from '../../../services/risk.services'; // Ensure this matches your file name

@Component({
  selector: 'app-risk-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-analysis.html',
  styleUrls: ['./risk-analysis.css']
})
export class RiskAnalysis implements OnInit, OnDestroy {

  brokerGridData: any[] = [];
  alerts: string[] = [];
  isLoading: boolean = true;
  
  // KPI Stats
  summaryStats = {
    totalBreaches: 0,
    totalExposure: 0,
    avgVolatility: 0
  };

  private dataSubscription: Subscription | undefined;

  constructor(
    private dashboardService: DashboardService,
    private riskService: RiskService,
    private cdr: ChangeDetectorRef // ✅ FIX: Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startLiveMonitoring();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  startLiveMonitoring() {
    // ✅ FIX: timer(0, 5000) starts immediately (0ms) and repeats every 5s
    this.dataSubscription = timer(0, 5000) 
      .pipe(
        switchMap(() => {
          // Fetch Clients (Portfolio Values) and Risk Configs (Limits) together
          return forkJoin({
            clients: this.dashboardService.getClients(),
            riskConfigs: this.riskService.getAllRiskMetrics()
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.calculateRiskData(res.clients, res.riskConfigs);
          this.isLoading = false;
          
          // ✅ FIX: Force UI update immediately
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Risk Data Error', err)
      });
  }

  calculateRiskData(clients: any[], riskConfigs: RiskMetric[]) {
    this.alerts = [];
    let totalExp = 0;
    let totalVol = 0;
    let breaches = 0;

    this.brokerGridData = clients.map(client => {
      // 1. Get Config from Backend (Risk Service) or default
      const config = riskConfigs.find(r => r.userId === client.id) || {
        volatility: 0.18, 
        confidenceLevel: 0.95,
        exposureLimit: 2500000,
        userId: client.id,
        currentExposure: 0
      };

      // 2. Calculations
      const exposure = client.portfolioValue || 0; 
      const zScore = 1.65; // 95% Confidence
      const vaR = exposure * config.volatility * zScore;
      const utilization = config.exposureLimit > 0 ? (exposure / config.exposureLimit) * 100 : 0;
      
      // 3. Status Logic
      const isBreach = utilization > 100;
      
      if (isBreach) {
        breaches++;
        this.alerts.push(`BREACH: ${client.name} (${client.id}) exceeded limit.`);
      }

      // 4. Update Aggregates
      totalExp += exposure;
      totalVol += config.volatility;

      return {
        userId: client.id,
        clientName: client.name,
        portfolioValue: exposure,
        volatility: config.volatility,
        calculatedVaR: vaR,
        currentExposure: exposure,
        exposureLimit: config.exposureLimit,
        utilization: utilization,
        status: isBreach ? 'BREACH' : 'SAFE'
      };
    });

    // Update UI Stats
    this.summaryStats = {
      totalBreaches: breaches,
      totalExposure: totalExp,
      avgVolatility: clients.length > 0 ? (totalVol / clients.length) : 0
    };
  }
}