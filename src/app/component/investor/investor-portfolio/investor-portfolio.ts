import { Component, OnInit } from '@angular/core'; // ⭐ Import OnInit
import { CommonModule } from '@angular/common';
import { PortfolioService, DisplayHolding } from '../../../services/investor-portfolio.service'; // ⭐ Import DisplayHolding
import { HttpClientModule } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs'; // ⭐ Import combineLatest, of
import { map, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service'; // Assuming path to AuthService

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // HttpClientModule should be imported at module level, but kept here for standalone clarity
  templateUrl: './investor-portfolio.html',
  styleUrls: ['./investor-portfolio.css']
})
export class InvestorPortfolio implements OnInit { // ⭐ Implement OnInit
  holdings$!: Observable<DisplayHolding[]>;
  portfolioSummary$!: Observable<{ totalValue: number; totalGainLoss: number }>;
  filteredHoldings$ = new BehaviorSubject<DisplayHolding[]>([]);
  activeFilter = 'All';

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService
    ) {}

    ngOnInit(): void {
        // ⭐ Initialize observables within ngOnInit
        this.holdings$ = this.portfolioService.getHoldings().pipe(
            // Ensure data integrity and run calculations if needed
            catchError(() => of([] as DisplayHolding[])) 
        );

        this.portfolioSummary$ = this.portfolioService.getPortfolioSummary();

        // Subscribe once to the main holdings stream to populate the BehaviorSubject
        // and apply the initial 'All' filter
        this.holdings$.subscribe(holdings => this.filteredHoldings$.next(holdings));
    }


    filterHoldings(type: string): void {
        this.activeFilter = type;
        this.holdings$.pipe(
            // Filter the holdings based on the selected type
            map(holdings => type === 'All' ? holdings : holdings.filter(h => h.type === type)),
            // Use take(1) to prevent multiple subscriptions causing memory leaks
        ).subscribe(filtered => this.filteredHoldings$.next(filtered));
    }
}