import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest, map, catchError, switchMap } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Injectable({ providedIn: 'root' })
export class InvestorDashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Investor
  getInvestor(investorID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/investors/${investorID}`).pipe(catchError(() => of(null)));
  }

  // Portfolios
  getPortfoliosByInvestor(investorID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/portfolios?investorID=${investorID}`).pipe(catchError(() => of([])));
  }

  getPrimaryPortfolio(investorID: number): Observable<any | null> {
    return this.getPortfoliosByInvestor(investorID).pipe(map(list => (list && list.length > 0 ? list[0] : null)));
  }

  // Market Prices
  getMarketPrices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marketPrices`).pipe(catchError(() => of([])));
  }

  // Trade Orders
  getTradeOrdersByPortfolio(portfolioID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tradeOrders?portfolioID=${portfolioID}`).pipe(catchError(() => of([])));
  }

  // Mapping helpers
  mapHoldingsWithMarket(portfolio: any | null, market: any[] = []): any[] {
    if (!portfolio) return [];
    const priceMap = new Map(market.map(m => [m.instrument, m.currentPrice]));
    return (portfolio.assetList || []).map((a: any) => {
      const currentPrice = priceMap.get(a.symbol) ?? a.currentPrice ?? a.avgPrice;
      const value = a.quantity * currentPrice;
      return {
        symbol: a.symbol,
        quantity: a.quantity,
        avgPrice: a.avgPrice,
        currentPrice,
        value
      };
    });
  }

  computeSummaryFromPortfolio(portfolio: any | null, market: any[] = []): any {
    if (!portfolio) return { totalValue: 0, totalInvested: 0, totalGainLoss: 0, gainLossPercent: 0 };
    const holdings = this.mapHoldingsWithMarket(portfolio, market);
    const totalValue = holdings.reduce((s, h) => s + h.value, 0);
    const totalInvested = (portfolio.assetList || []).reduce((s: number, a: any) => s + a.quantity * a.avgPrice, 0);
    const totalGainLoss = totalValue - totalInvested;
    const gainLossPercent = totalInvested > 0 ? Number(((totalGainLoss / totalInvested) * 100).toFixed(2)) : 0;
    return { totalValue, totalInvested, totalGainLoss, gainLossPercent };
  }

  // Dashboard methods

  getPortfolioSummary(investorID: number): Observable<any> {
    return combineLatest([this.getPrimaryPortfolio(investorID), this.getMarketPrices()]).pipe(
      map(([portfolio, market]) => this.computeSummaryFromPortfolio(portfolio, market))
    );
  }

  getTopHoldings(investorID: number, topN = 5): Observable<any[]> {
    return combineLatest([this.getPrimaryPortfolio(investorID), this.getMarketPrices()]).pipe(
      map(([portfolio, market]) => this.mapHoldingsWithMarket(portfolio, market)),
      map(list => list.sort((a, b) => b.value - a.value).slice(0, topN))
    );
  }

  getRecentOrders(investorID: number, topN = 5): Observable<any[]> {
    return this.getPrimaryPortfolio(investorID).pipe(
      switchMap(portfolio => {
        if (!portfolio) return of([]);
        return this.getTradeOrdersByPortfolio(portfolio.portfolioID);
      }),
      map(list =>
        list
          .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
          .slice(0, topN)
      ),
      catchError(() => of([]))
    );
  }

  // Market overview (near asset allocation)
  getMarketOverview(): Observable<any> {
    return this.getMarketPrices().pipe(
      map(prices => {
        const totalInstruments = prices.length;
        const lastUpdated =
          prices.length > 0
            ? new Date(
                prices.reduce((max, p) => (new Date(p.timestamp).getTime() > max ? new Date(p.timestamp).getTime() : max), 0)
              )
            : null;

        const topByPrice = [...prices]
          .sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))
          .slice(0, 5)
          .map(p => ({ instrument: p.instrument, currentPrice: p.currentPrice }));

        return { totalInstruments, lastUpdated, topByPrice };
      }),
      catchError(() => of({ totalInstruments: 0, lastUpdated: null, topByPrice: [] }))
    );
  }

  // Charts

  // Asset allocation pie (doughnut) chart
  buildAssetPieChart(canvasId: string, investorID: number): void {
    combineLatest([this.getPrimaryPortfolio(investorID), this.getMarketPrices()])
      .pipe(
        map(([portfolio, market]) => this.mapHoldingsWithMarket(portfolio, market)),
        map(holdings => {
          const labels = holdings.map(h => h.symbol);
          const data = holdings.map(h => h.value);
          return { labels, data };
        }),
        catchError(() => of({ labels: [], data: [] }))
      )
      .subscribe(({ labels, data }) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
        if (!canvas || !labels.length) return;

        const ensureChartJs = (): Promise<void> => new Promise(resolve => {
          // @ts-ignore
          if (window.Chart) return resolve();
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
          script.onload = () => resolve();
          document.body.appendChild(script);
        });

        ensureChartJs().then(() => {
          // @ts-ignore
          const Chart = (window as any).Chart;
          new Chart(canvas.getContext('2d'), {
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
        });
      });
  }
}
