
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL

  constructor(private http: HttpClient) {}

  // Fetch holdings and calculate derived fields
  getHoldings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/holdings`).pipe(
      map(holdings =>
        holdings.map(h => {
          const value = h.quantity * h.currentPrice;
          const gainLoss = value - (h.quantity * h.avgPrice);
          const gainLossPercent = ((gainLoss / (h.quantity * h.avgPrice)) * 100).toFixed(2);
          return {
            ...h,
            value,
            gainLoss,
            gainLossPercent: parseFloat(gainLossPercent)
          };
        })
      )
    );
  }

  // Calculate portfolio summary
  getPortfolioSummary(): Observable<{ totalValue: number; totalGainLoss: number }> {
    return this.getHoldings().pipe(
      map(holdings => {
        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
        const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
        return { totalValue, totalGainLoss };
      })
       );
  }
}