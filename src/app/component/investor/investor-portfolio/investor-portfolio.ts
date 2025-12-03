
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../services/investor-portfolio.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investor-portfolio.html',
  styleUrls: ['./investor-portfolio.css']
})
export class InvestorPortfolio {
  
portfolioSummary$: Observable<{ totalValue: number; totalGainLoss: number; holdings: any[] }>;
  filteredHoldings$: Observable<any[]>;
  activeFilter = 'All';
  
constructor(private portfolioService: PortfolioService) {
    this.portfolioSummary$ = this.portfolioService.getPortfolioSummary();
    this.filteredHoldings$ = this.portfolioSummary$.pipe(map(summary => summary.holdings));
  }

filterHoldings(type: string) {
    this.activeFilter = type;
    this.filteredHoldings$ = this.portfolioSummary$.pipe(
      map(summary =>
        type === 'All' ? summary.holdings : summary.holdings.filter(h => h.type === type)
      )
    );
  }
}