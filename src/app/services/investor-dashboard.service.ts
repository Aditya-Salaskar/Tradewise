
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestorDashboardService {
  private holdingsUrl = 'assets/mock-data/holdings.json';
  private ordersUrl = 'assets/mock-data/orders.json';

  constructor(private http: HttpClient) {}

  getHoldings(): Observable<any[]> {
    return this.http.get<any[]>(this.holdingsUrl);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.ordersUrl);
  }

  getPortfolioSummary(): Observable<any> {
    return this.getHoldings().pipe(
      map(holdings => {
        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
        const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
        const totalGainLoss = totalValue - totalInvested;
        const gainLossPercent = ((totalGainLoss / totalInvested) * 100).toFixed(2);

        return {
          totalValue,
          totalInvested,
          totalGainLoss,
          gainLossPercent: Number(gainLossPercent)
        };
      })
    );
  }
}