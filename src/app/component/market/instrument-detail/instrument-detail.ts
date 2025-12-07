import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarketDataService, StockRow, HistoricalPricePoint } from '../../../services/market-data.service'; // Ensure HistoricalPricePoint is imported from service
import { switchMap, map } from 'rxjs/operators'; // map was missing
import { Observable, forkJoin } from 'rxjs';
import { ChartOptions, ChartType, ChartData, ChartDataset, Point } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-instrument-details',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './instrument-detail.html',
  styleUrls: ['./instrument-detail.css']
})
export class InstrumentDetails implements OnInit{
  public lineChartType: 'line' = 'line';

  stock$!: Observable<StockRow | null>; 
  
  public lineChartData: ChartData<'line', (number | Point)[]> = {
    datasets: [{ data: [], label: 'Price' }] as ChartDataset<'line', (number | Point)[]>[],
    labels: []
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { title: { display: true, text: 'Time' }, type: 'category' },
        y: { title: { display: true, text: 'Price (₹)' }, beginAtZero: false }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketData: MarketDataService
  ) {}

  ngOnInit(): void {
    const symbol$ = this.route.paramMap.pipe(
      map(params => params.get('symbol') ?? '')
    );
    const allData$ = symbol$.pipe(
      switchMap(symbol => forkJoin({
        stock: this.marketData.getStockBySymbol(symbol),
        history: this.marketData.getPriceHistoryBySymbol(symbol)
      }))
    );
    this.stock$ = allData$.pipe(
      map(data => data.stock)
    );
    allData$.subscribe(data => {
      if (data.history.length > 0) {
        this.prepareChartData(data.history);
      }
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private prepareChartData(history: HistoricalPricePoint[]): void {
    const labels = history.map(p => this.formatTimestamp(p.timestamp)); 
    const data = history.map(p => p.price);

    this.lineChartData = {
      labels: labels,
      datasets: [{
        data: data,
        label: 'Price',
        borderColor: '#3cba9f',
        backgroundColor: 'rgba(60, 186, 159, 0.3)',
        fill: true,
        tension: 0.4
      }] as ChartDataset<'line', number[]>[]
    };
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}