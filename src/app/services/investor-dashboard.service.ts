
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestorDashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ✅ Portfolio Summary
  getPortfolioSummary(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/holdings`).pipe(
      map(holdings => {
        if (!holdings || holdings.length === 0) {
          return { totalValue: 0, totalInvested: 0, totalGainLoss: 0, gainLossPercent: 0 };
        }
        const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
        const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
        const totalGainLoss = totalValue - totalInvested;
        const gainLossPercent = ((totalGainLoss / totalInvested) * 100).toFixed(2);
        return { totalValue, totalInvested, totalGainLoss, gainLossPercent };
      }),
      catchError(err => {
        console.error('Error fetching portfolio summary:', err);
        return of(null);
      })
    );
  }

  // ✅ Top Holdings
  getHoldings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/holdings`).pipe(
      map(holdings => holdings.map(h => ({
        symbol: h.symbol,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice: h.currentPrice,
        value: h.quantity * h.currentPrice
      }))),
      catchError(err => {
        console.error('Error fetching holdings:', err);
        return of([]);
      })
    );
  }

  // ✅ Recent Orders
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`).pipe(
           catchError(err => {
        console.error('Error fetching orders:', err);
        return of([]);
      })
    );
  }
}