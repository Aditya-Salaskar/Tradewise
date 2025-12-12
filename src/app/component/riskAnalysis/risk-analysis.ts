import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service'
import { RiskService, RiskMetric } from '../../services/risk.services'

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

  summaryStats = {
    totalBreaches: 0,
    totalExposure: 0,
    avgVolatility: 0
  };

  private dataSubscription: Subscription | undefined;

  constructor(
    private dashboardService: DashboardService,
    private riskService: RiskService,
    private cdr: ChangeDetectorRef
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
    this.dataSubscription = timer(0, 5000)
      .pipe(
        switchMap(() => {
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
      // 1. Get Config
      const config = riskConfigs.find(r => r.userId === client.id) || {
        volatility: 0.18,
        confidenceLevel: 0.95,
        exposureLimit: 2500000,
        userId: client.id,
        currentExposure: 0
      };

      const portfolioValue = client.portfolioValue || 0;

      // ✅ USE SHARED CALCULATION LOGIC
      const riskStatus = this.dashboardService.calculateRiskStatus(portfolioValue, config.exposureLimit);

      // 2. VaR (Specific to this view)
      const zScore = 1.65;
      const vaR = portfolioValue * config.volatility * zScore;

      // 3. Alerts
      if (riskStatus.status === 'BREACH') {
        breaches++;
        this.alerts.push(`BREACH: ${client.name} (${client.id}) exceeded limit.`);
      }

      // 4. Aggregates
      totalExp += portfolioValue;
      totalVol += config.volatility;

      return {
        userId: client.id,
        clientName: client.name,
        portfolioValue: portfolioValue,
        volatility: config.volatility,
        calculatedVaR: vaR,
        currentExposure: portfolioValue,
        exposureLimit: config.exposureLimit,
        utilization: riskStatus.utilization, // Use shared util %
        status: riskStatus.status // Use shared status string
      };
    });

    this.summaryStats = {
      totalBreaches: breaches,
      totalExposure: totalExp,
      avgVolatility: clients.length > 0 ? (totalVol / clients.length) : 0
    };
  }
}
