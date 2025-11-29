
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-instrument-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instrument-detail.html',
  styleUrls: ['./instrument-detail.css']
})
export class InstrumentDetails implements OnInit {
  stock?: Stock;

  private allStocks: Stock[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2580, change: 45, changePercent: 1.78, volume: 1245000, high: 2625, low: 2545 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3450, change: -25, changePercent: -0.72, volume: 856000, high: 3490, low: 3440 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1520, change: 18, changePercent: 1.20, volume: 2150000, high: 1535, low: 1505 },
    { symbol: 'HDFC', name: 'HDFC Bank', price: 2720, change: 32, changePercent: 1.19, volume: 945000, high: 2745, low: 2695 },
    { symbol: 'ITC', name: 'ITC Limited', price: 445, change: -5, changePercent: -1.11, volume: 3250000, high: 452, low: 443 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 985, change: 12, changePercent: 1.23, volume: 1890000, high: 992, low: 978 },
    { symbol: 'SBIN', name: 'State Bank of India', price: 625, change: -8, changePercent: -1.26, volume: 4150000, high: 638, low: 622 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1245, change: 22, changePercent: 1.80, volume: 1560000, high: 1258, low: 1235 }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const symbol = this.route.snapshot.paramMap.get('symbol');
    this.stock = this.allStocks.find(s => s.symbol === symbol);
  }

  goBack() {
    this.router.navigate(['/investor/market']);
  }
}
