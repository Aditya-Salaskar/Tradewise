
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { catchError } from 'rxjs/operators';
// import { of } from 'rxjs';
// import { BrokerInvestorService, InvestorSummary, Holding } from '../../../services/broker-investor.service';

// @Component({
//   selector: 'app-broker-investor-portfolio',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './broker-investor-portfolio.html',
//   styleUrls: ['./broker-investor-portfolio.css']
// })
// export class BrokerInvestorPortfolio implements OnInit {
//   investorId!: string;
//   investorIdInput = '';
//   loading = true;

//   summary?: InvestorSummary;
//   holdings: Holding[] = [];

//   searchTerm = '';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private investorService: BrokerInvestorService
//   ) {}

//   ngOnInit(): void {
//     this.investorId = this.route.snapshot.paramMap.get('id') || '';
//     this.investorIdInput = this.investorId;
//     this.refresh();
//   }

//   refresh(): void {
//     if (!this.investorId) {
//       this.loading = false;
//       return;
//     }

//     this.loading = true;

//     this.investorService.getInvestorSummary(this.investorId)
//       .pipe(catchError(() => of<InvestorSummary | undefined>(undefined)))
//       .subscribe(s => this.summary = s);

//     this.investorService.getInvestorHoldings(this.investorId)
//       .pipe(catchError(() => of<Holding[]>([])))
//       .subscribe(h => {
//         this.holdings = h;
//         this.loading = false;
//       });
//   }

//   filteredHoldings(): Holding[] {
//     const q = this.searchTerm.trim().toLowerCase();
//     if (!q) return this.holdings;
//     return this.holdings.filter(h =>
//       h.symbol.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
//     );
//   }

//   viewInstrument(symbol: string): void {
//     this.router.navigate(['/broker/market', symbol]);
//   }

//   loadInvestor(): void {
//     if (!this.investorIdInput) return;
//     this.router.navigate(['/broker/investor', this.investorIdInput, 'portfolio']);
//   }

//   goBack(): void {
//     this.router.navigate(['/broker/dashboard']);
//   }
// }
