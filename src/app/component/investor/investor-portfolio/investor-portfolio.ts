
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../services/investor-portfolio.service';
import { HttpClientModule } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './investor-portfolio.html',
  styleUrls: ['./investor-portfolio.css']
})
export class InvestorPortfolio {
  holdings$: Observable<any[]>;
  portfolioSummary$: Observable<{ totalValue: number; totalGainLoss: number }>;
  filteredHoldings$ = new BehaviorSubject<any[]>([]);
  activeFilter = 'All';

  constructor(private portfolioService: PortfolioService) {
    this.holdings$ = this.portfolioService.getHoldings();
    this.portfolioSummary$ = this.portfolioService.getPortfolioSummary();

    // Initialize filteredHoldings with all holdings
    this.holdings$.subscribe(holdings => this.filteredHoldings$.next(holdings));
  }

  filterHoldings(type: string) {
    this.activeFilter = type;
    this.holdings$.pipe(
      map(holdings => type === 'All' ? holdings : holdings.filter(h => h.type === type))
    ).subscribe(filtered => this.filteredHoldings$.next(filtered));
  }
}
