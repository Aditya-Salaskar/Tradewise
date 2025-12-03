import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';   // <-- REQUIRED
import { FormsModule } from '@angular/forms';     // <-- for ngModel

@Component({
  selector: 'app-risk-analysis',
  standalone: true,               // <---- VERY IMPORTANT
  imports: [CommonModule, FormsModule],   // <---- ADD THIS
  templateUrl: './risk-analysis.html',
  styleUrls: ['./risk-analysis.css']
})
export class RiskAnalysis {

  summary = {
    portfolioValue: 1250000,
    varValue: 62500,
    varPercent: '5%',
    sharpeRatio: 1.45,
    beta: 1.12,
    alpha: '2.3%'
  };

  holdings = [
    { symbol: 'RELIANCE', weight: 20.64, beta: 1.15, var: 12900, risk: 20.6 },
    { symbol: 'TCS', weight: 13.8, beta: 0.95, var: 8625, risk: 13.8 },
    { symbol: 'INFY', weight: 18.24, beta: 1.05, var: 11400, risk: 18.2 },
    { symbol: 'HDFC', weight: 17.41, beta: 1.2, var: 10880, risk: 17.4 },
    { symbol: 'ITC', weight: 7.12, beta: 0.85, var: 4450, risk: 7.1 },
    { symbol: 'BOND-001', weight: 22.79, beta: 0.25, var: 4960, risk: 7.9 }
  ];

  recalculate() {
    alert("VaR Recalculated");
  }
}
