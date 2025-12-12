import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export interface DisplayHolding {
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getHoldings(): Observable<DisplayHolding[]> {
    // 1. Get Logged-in User ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      const currentUser = this.authService.getCurrentUser();
      userId = currentUser?.id || 'e88b';
    }

    return forkJoin({
      portfolios: this.http.get<any[]>(`${this.baseUrl}/portfolios?investorId=${userId}`),
      instruments: this.http.get<any[]>(`${this.baseUrl}/instruments`),
      prices: this.http.get<any[]>(`${this.baseUrl}/priceHistories`)
    }).pipe(
      map(data => {
        // 2. Get Latest Market Prices (Strictly from DB)
        const priceMap = new Map<number, number>();

        // Sort prices by ID or Date to ensure we get the latest one
        // Assuming higher ID = newer price
        const sortedPrices = data.prices.sort((a, b) => a.priceId - b.priceId);

        sortedPrices.forEach(p => {
          priceMap.set(p.instrumentId, p.price);
        });

        // 3. Map Instruments
        const instrumentMap = new Map<number, any>();
        data.instruments.forEach(i => instrumentMap.set(i.instrumentId, i));

        // 4. Build Display Data
        return data.portfolios.map(p => {
          const instrument = instrumentMap.get(p.instrumentId);

          // STRICT LOGIC:
          // Get price from DB history.
          // If no history exists, fallback to Avg Cost (Profit = 0).
          // NO RANDOM FLUCTUATIONS.
          const currentPrice = priceMap.get(p.instrumentId) || p.averageCostPrice;

          // Calculations
          const value = p.quantityHeld * currentPrice;
          const invested = p.quantityHeld * p.averageCostPrice;
          const gainLoss = value - invested;

          let gainLossPercent = 0;
          if (invested > 0) {
            gainLossPercent = (gainLoss / invested) * 100;
          }

          return {
            symbol: instrument?.tickerSymbol || 'UNK',
            name: instrument?.companyName || 'Unknown Stock',
            type: instrument?.assetType || 'Stock',
            quantity: p.quantityHeld, // Updates only when Broker Approves
            avgPrice: p.averageCostPrice,
            currentPrice: currentPrice,
            value: value,
            gainLoss: gainLoss,
            gainLossPercent: parseFloat(gainLossPercent.toFixed(2))
          };
        });
      })
    );
  }

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
