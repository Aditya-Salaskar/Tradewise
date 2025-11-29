import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestorNav } from "../../investor/investor-nav/investor-nav";
import { RouterModule, Router } from '@angular/router';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

interface Index {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

@Component({
  selector: 'app-market-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InvestorNav, RouterModule],
  templateUrl: './market-list.html',
  styleUrls: ['./market-list.css']
})
export class MarketList {
constructor(private router: Router) {}
  

navigateToDetails(symbol: string) {
    this.router.navigate(['/market', symbol]);
  }


  stocks: Stock[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2580, change: 45, changePercent: 1.78, volume: 1245000, high: 2625, low: 2545 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3450, change: -25, changePercent: -0.72, volume: 856000, high: 3490, low: 3440 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1520, change: 18, changePercent: 1.20, volume: 2150000, high: 1535, low: 1505 },
    { symbol: 'HDFC', name: 'HDFC Bank', price: 2720, change: 32, changePercent: 1.19, volume: 945000, high: 2745, low: 2695 },
    { symbol: 'ITC', name: 'ITC Limited', price: 445, change: -5, changePercent: -1.11, volume: 3250000, high: 452, low: 443 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 985, change: 12, changePercent: 1.23, volume: 1890000, high: 992, low: 978 },
    { symbol: 'SBIN', name: 'State Bank of India', price: 625, change: -8, changePercent: -1.26, volume: 4150000, high: 638, low: 622 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1245, change: 22, changePercent: 1.80, volume: 1560000, high: 1258, low: 1235 }
  ];

  indices: Index[] = [
    { name: 'NIFTY 50', value: 19850.25, change: 125.50, changePercent: 0.64 },
    { name: 'SENSEX', value: 66250.75, change: 350.25, changePercent: 0.53 },
    { name: 'BANK NIFTY', value: 45200.50, change: -85.25, changePercent: -0.19 }
  ];

  searchTerm: string = '';
  sectorFilter: string = 'All Sectors';

  get filteredStocks(): Stock[] {
    return this.stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }
}
