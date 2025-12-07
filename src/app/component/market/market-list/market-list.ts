
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { MarketDataService, StockRow } from '../../../services/market-data.service';

@Component({
  selector: 'app-market-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './market-list.html',
  styleUrls: ['./market-list.css']
})
export class MarketList implements OnInit{
  searchTerm: string = '';
  sectorFilter: string = 'All Sectors';

  stocks$!: Observable<StockRow[]>;
  filteredStocks$!: Observable<StockRow[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketData: MarketDataService
  ) {}

  ngOnInit(): void {
    this.stocks$ = this.marketData.getStocks();

    this.filteredStocks$ = this.stocks$.pipe(
      map(stocks => this.applyFilters(stocks))
    );
  }

  navigateToDetails(symbol: string) {
    this.router.navigate(['../market', symbol], { relativeTo: this.route });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.filteredStocks$ = this.stocks$.pipe(
      map(stocks => this.applyFilters(stocks))
    );
  }

  applyFilters(stocks: StockRow[]): StockRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    const sector = this.sectorFilter;

    return stocks.filter(s => {
      const matchesSearch =
        !term ||
        s.symbol.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term);

      const matchesSector =
        sector === 'All Sectors' || s.sector.toLowerCase() === sector.toLowerCase();

      return matchesSearch && matchesSector;
    });
  }

  trackByInstrument(index: number, item: StockRow) {
    return item.instrumentId;
  }

  buyInstrument(stock: StockRow) {
    this.router.navigate(['/investor/trade'], { 
        queryParams: { 
            symbol: stock.symbol 
        } 
    });
  }
}
