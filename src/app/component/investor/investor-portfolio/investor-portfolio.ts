import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService, DisplayHolding } from '../../../services/investor-portfolio.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investor-portfolio.html',
  styleUrls: ['./investor-portfolio.css']
})
export class InvestorPortfolio implements OnInit {
  
  // Data Streams
  allHoldings$!: Observable<DisplayHolding[]>;
  portfolioSummary$!: Observable<{ totalValue: number; totalGainLoss: number }>;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    // 1. Fetch Master Data
    this.allHoldings$ = this.portfolioService.getHoldings();
    this.portfolioSummary$ = this.portfolioService.getPortfolioSummary();
  }
}