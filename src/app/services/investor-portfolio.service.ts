import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL

  constructor(private http: HttpClient) {}

  // Fetch holdings from portfolio.assetList
 getHoldings(portfolioID: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/portfolios?portfolioID=${portfolioID}`).pipe(
    map(portfolios => {
      const portfolio = portfolios[0];
      if (!portfolio || !portfolio.assetList) return [];
      return portfolio.assetList.map((h: any) => {
        const invested = h.quantity * h.avgPrice;
        const value = h.quantity * h.currentPrice;
        const gainLoss = value - invested;
        const gainLossPercent =
          invested > 0 ? parseFloat(((gainLoss / invested) * 100).toFixed(2)) : 0;
        return { ...h, value, gainLoss, gainLossPercent };
      });
    }),
    catchError(() => of([]))
  );
}
  // Portfolio summary
  getPortfolioSummary(portfolioID: number): Observable<{ totalValue: number; totalGainLoss: number }> {
    return this.getHoldings(portfolioID).pipe(
      map(holdings => {
        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
        const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
        return { totalValue, totalGainLoss };
      })
    );
  }
}
