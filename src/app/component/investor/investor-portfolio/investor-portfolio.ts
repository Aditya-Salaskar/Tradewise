
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../services/investor-portfolio.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-portfolio.html',
  styleUrls: ['./investor-portfolio.css']
})
export class InvestorPortfolio implements OnInit {
  holdings: any[] = [];
  filteredHoldings: any[] = [];
  activeFilter = 'All';
  totalValue = 0;
  totalGainLoss = 0;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.portfolioService.getPortfolioSummary().subscribe(summary => {
      this.holdings = summary.holdings;
      this.filteredHoldings = [...this.holdings];
      this.totalValue = summary.totalValue;
      this.totalGainLoss = summary.totalGainLoss;
    });
  }

  filterHoldings(type: string) {
    this.activeFilter = type;
    this.filteredHoldings = type === 'All'
           ? [...this.holdings]
      : this.holdings.filter(h => h.type === type);
    this.calculateTotals();
  }

  private calculateTotals() {
    this.totalValue = this.filteredHoldings.reduce((sum, h) => sum + h.value, 0);
    this.totalGainLoss = this.filteredHoldings.reduce((sum, h) => sum + h.gainLoss, 0);
  }
}