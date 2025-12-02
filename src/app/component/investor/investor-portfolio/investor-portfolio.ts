
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../services/investor-portfolio.service';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-portfolio.html',
  styleUrls: ['./investor-portfolio.css']
})
export class InvestorPortfolio {
  portfolioSummary$: Observable<{ totalValue: number; totalGainLoss: number; holdings: any[] }>;
  holdings: any[] = [];
  filteredHoldings: any[] = [];
  orders: any[] = [];
  activeFilter = 'All';
  availableTypes: string[] = [];

  constructor(private portfolioService: PortfolioService) {
    this.portfolioSummary$ = this.portfolioService.getPortfolioSummary();

       this.portfolioService.getPortfolioData().subscribe(data => {
      this.holdings = data.holdings;
      this.filteredHoldings = [...this.holdings];
      this.availableTypes = this.getAvailableTypes(this.holdings);
      this.orders = data.orders;
    });
  }

  filterHoldings(type: string) {
    this.activeFilter = type;
    this.filteredHoldings = type === 'All'
      ? [...this.holdings]
      : this.holdings.filter(h => h.type === type);
  }

  private getAvailableTypes(holdings: any[]): string[] {
    return Array.from(new Set(holdings.map(h => h.type)));
  }
}