import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, switchMap, forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Re-using simplified models based on the portfolio structure
interface Holding {
    id: string;
    investorId: string;
    instrumentId: number;
    quantityHeld: number;
    averageCostPrice: number;
}
interface Instrument {
    instrumentId: number;
    tickerSymbol: string;
    companyName: string;
    assetType: string;
}
interface PriceHistory {
    instrumentId: number;
    price: number;
    timestamp: string;
}
interface OrderRecord {
    id: string;
    investorId: string;
    instrumentId: number;
    orderType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: string;
    timestamp: string;
}

interface ChartDataResult {
    labels: string[]; // Chart.js needs string[] for labels
    data: number[];   // Chart.js needs number[] for data
}

@Injectable({ providedIn: 'root' })
export class InvestorDashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // --- Core Data Fetching ---

  getHoldingsByInvestor(investorId: string): Observable<Holding[]> {
    // Fetch holdings where quantityHeld > 0 for the investor
    return this.http.get<Holding[]>(`${this.apiUrl}/portfolios?investorId=${investorId}&quantityHeld_gt=0`).pipe(catchError(() => of([])));
  }

  getInstruments(): Observable<Instrument[]> {
    return this.http.get<Instrument[]>(`${this.apiUrl}/instruments`).pipe(catchError(() => of([])));
  }

  getMarketPrices(): Observable<PriceHistory[]> {
    // Fetches all price histories for calculation
    return this.http.get<PriceHistory[]>(`${this.apiUrl}/priceHistories`).pipe(catchError(() => of([])));
  }

  getRecentOrdersByInvestor(investorId: string, topN: number): Observable<OrderRecord[]> {
    // Fetches all orders for the investor and sorts/limits client-side (JSON Server does not support sorting/slicing)
    return this.http.get<OrderRecord[]>(`${this.apiUrl}/orders?investorId=${investorId}`).pipe(
      map(orders => 
        orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, topN)
      ),
      catchError(() => of([]))
    );
  }

  // --- Mapping & Calculation Helpers ---

  // Fetches instrument details and latest prices for holdings
  private mapHoldingsWithMarketData(holdings: Holding[], instruments: Instrument[], prices: PriceHistory[]): any[] {
    const instrumentMap = new Map(instruments.map(i => [i.instrumentId, i]));
    const latestPriceMap = this.getLatestPriceMap(prices);

    return holdings.map(h => {
      const instrument = instrumentMap.get(h.instrumentId);
      const currentPrice = latestPriceMap.get(h.instrumentId) ?? h.averageCostPrice;
      const invested = h.quantityHeld * h.averageCostPrice;
      const value = h.quantityHeld * currentPrice;
      const gainLoss = value - invested;

      return {
        symbol: instrument?.tickerSymbol || 'N/A',
        quantity: h.quantityHeld,
        avgPrice: parseFloat(h.averageCostPrice.toFixed(2)),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        value: parseFloat(value.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        type: instrument?.assetType || 'Equity'
      };
    });
  }

  // Helper to find the latest price per instrument ID
  private getLatestPriceMap(prices: PriceHistory[]): Map<number, number> {
    const latestPrices = new Map<number, number>();
    const sortedPrices = prices.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    for (const p of sortedPrices) {
        if (!latestPrices.has(p.instrumentId)) {
            latestPrices.set(p.instrumentId, p.price);
        }
    }
    return latestPrices;
  }

  // --- Dashboard Methods ---

  getPortfolioSummary(investorId: string): Observable<any> {
    return forkJoin({
      holdings: this.getHoldingsByInvestor(investorId),
      instruments: this.getInstruments(),
      prices: this.getMarketPrices()
    }).pipe(
      map(data => {
        const mappedHoldings = this.mapHoldingsWithMarketData(data.holdings, data.instruments, data.prices);
        
        const totalValue = mappedHoldings.reduce((s, h) => s + h.value, 0);
        const totalInvested = data.holdings.reduce((s, h) => s + h.quantityHeld * h.averageCostPrice, 0);
        const totalGainLoss = totalValue - totalInvested;
        const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
        
        return { 
          totalValue: parseFloat(totalValue.toFixed(2)), 
          totalInvested: parseFloat(totalInvested.toFixed(2)), 
          totalGainLoss: parseFloat(totalGainLoss.toFixed(2)), 
          gainLossPercent: parseFloat(gainLossPercent.toFixed(2)) 
        };
      }),
      catchError(() => of({ totalValue: 0, totalInvested: 0, totalGainLoss: 0, gainLossPercent: 0 }))
    );
  }

  getTopHoldings(investorId: string, topN = 5): Observable<any[]> {
    return forkJoin({
      holdings: this.getHoldingsByInvestor(investorId),
      instruments: this.getInstruments(),
      prices: this.getMarketPrices()
    }).pipe(
      map(data => {
        const mappedHoldings = this.mapHoldingsWithMarketData(data.holdings, data.instruments, data.prices);
        // Sort by value and slice
        return mappedHoldings.sort((a, b) => b.value - a.value).slice(0, topN);
      }),
      catchError(() => of([]))
    );
  }

  getRecentOrders(investorId: string, topN = 5): Observable<any[]> {
    return forkJoin({
      orders: this.getRecentOrdersByInvestor(investorId, topN),
      instruments: this.getInstruments()
    }).pipe(
      map(data => {
        const instrumentMap = new Map(data.instruments.map(i => [i.instrumentId, i]));
        
        return data.orders.map(o => ({
          orderID: o.id,
          instrument: instrumentMap.get(o.instrumentId)?.tickerSymbol || 'N/A',
          type: o.orderType,
          quantity: o.quantity,
          price: o.price,
          status: o.status,
          timestamp: o.timestamp
        }));
      }),
      catchError(() => of([]))
    );
  }
  
  // Market overview (near asset allocation)
  getMarketOverview(): Observable<any> {
    return forkJoin({
      instruments: this.getInstruments(),
      prices: this.getMarketPrices()
    }).pipe(
      map(data => {
        const latestPriceMap = this.getLatestPriceMap(data.prices);
        const instrumentMap = new Map(data.instruments.map(i => [i.instrumentId, i.tickerSymbol]));
        
        const totalInstruments = data.instruments.length;
        
        // Find the overall latest timestamp from all price updates
        const lastUpdatedDate = data.prices.length > 0
            ? new Date(data.prices.reduce((max, p) => (new Date(p.timestamp).getTime() > max ? new Date(p.timestamp).getTime() : max), 0))
            : null;

        // Get prices only for instruments that have a latest price
        const topByPrice = Array.from(latestPriceMap.entries())
            .map(([instrumentId, currentPrice]) => ({
                instrument: instrumentMap.get(instrumentId) || 'N/A',
                currentPrice: parseFloat(currentPrice.toFixed(2))
            }))
            .sort((a, b) => b.currentPrice - a.currentPrice)
            .slice(0, 5);

        return { totalInstruments, lastUpdated: lastUpdatedDate, topByPrice };
      }),
      catchError(() => of({ totalInstruments: 0, lastUpdated: null, topByPrice: [] }))
    );
  }


  // Charts
  buildAssetPieChart(canvasId: string, investorId: string): void {
    forkJoin({
      holdings: this.getHoldingsByInvestor(investorId),
      instruments: this.getInstruments(),
      prices: this.getMarketPrices()
    })
      .pipe(
        map(data => this.mapHoldingsWithMarketData(data.holdings, data.instruments, data.prices)),
        map(holdings => {
          // Group holdings by assetType and sum their value for allocation
          const allocationMap = holdings.reduce((acc, h) => {
            const type = h.type || 'Other';
            acc.set(type, (acc.get(type) || 0) + h.value);
            return acc;
          }, new Map<string, number>());
          
          const labels: string[] = Array.from(allocationMap.keys());
          const data: number[] = Array.from(allocationMap.values()).map(v => parseFloat((v as number).toFixed(2)));

          return { labels, data } as ChartDataResult;
        }),
        catchError(() => of({ labels: [] as string[], data: [] as number[] } as ChartDataResult))
      )
      .subscribe(({ labels, data }) => {
        // ... (Chart.js setup remains the same) ...
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
        if (!canvas || !labels.length) return;

        // Simplified Chart.js loading for brevity (assuming Chart.js is available globally or imported)
        const context = canvas.getContext('2d');
        if (context) {
            new Chart(context, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [
                        {
                            data,
                            backgroundColor: [
                                '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f',
                                '#edc949','#af7aa1','#ff9da7','#9c755f','#bab0ab'
                            ],
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: (ctx: any) => `${ctx.label}: ₹${ctx.parsed.toLocaleString()}`
                            }
                        }
                    }
                }
            });
        }
      });
  }
}