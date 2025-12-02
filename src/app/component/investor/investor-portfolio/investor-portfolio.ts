
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
  activeFilter = 'All';
  availableTypes: string[] = []; // ✅ Dynamic filter types

  constructor(private portfolioService: PortfolioService) {
    this.portfolioSummary$ = this.portfolioService.getPortfolioSummary();

    // Load holdings and initialize filters
    this.portfolioSummary$.subscribe(summary => {
      this.holdings = summary.holdings;
      this.filteredHoldings = [...this.holdings]; // Show all initially
      this.availableTypes = this.getAvailableTypes(this.holdings); // ✅ Extract types dynamically
    });
  }

  filterHoldings(type: string) {
    this.activeFilter = type;
    this.filteredHoldings = type === 'All'
      ? [...this.holdings]
      : this.holdings.filter(h => h.type === type);
  }

  private getAvailableTypes(holdings: any[]): string[] {
    const types = holdings.map(h => h.type);
       return Array.from(new Set(types)); // ✅ Unique types
  }
}