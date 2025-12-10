
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map, Observable, forkJoin, of} from 'rxjs';
import { Instrument, PriceHistory, FinancialData } from '../models/instrument.model';

export interface HistoricalPricePoint {
  timestamp: string;
  price: number;
}

export interface StockRow {
  instrumentId: number;
  symbol: string;
  name: string;
  sector: string;
  price: number | null;
  volume: number | null;
  high: number | null;
  low: number | null;
  timestamp: string | null;
}

@Injectable({ providedIn: 'root' })
export class MarketDataService {
  private readonly baseUrl = 'http://localhost:3000'; // adjust if using proxy

  constructor(private http: HttpClient) {}

  getStocks(): Observable<StockRow[]> {
    const instruments$ = this.http.get<Instrument[]>(`${this.baseUrl}/instruments`);
    const priceHistories$ = this.http.get<PriceHistory[]>(`${this.baseUrl}/priceHistories`);

    return forkJoin({ instruments: instruments$, priceHistories: priceHistories$ }).pipe(
      map((data: FinancialData) => {
        const latestByInstrument = this.pickLatestPrices(data.priceHistories);

        return data.instruments.map(inst => {
          const latest = latestByInstrument.get(inst.instrumentId);
          return {
            instrumentId: inst.instrumentId,
            symbol: inst.tickerSymbol,
            name: inst.companyName,
            sector: inst.sector,
            price: latest?.price ?? null,
            volume: latest?.volume ?? null,
            high: latest?.dailyHigh ?? null,
            low: latest?.dailyLow ?? null,
            timestamp: latest?.timestamp ?? null
          } as StockRow;
        });
      }),
    );
  }

  private pickLatestPrices(histories: PriceHistory[]): Map<number, PriceHistory> {
    const mapLatest = new Map<number, PriceHistory>();
    for (const h of histories || []) {
      const existing = mapLatest.get(h.instrumentId);
      if (!existing) {
        mapLatest.set(h.instrumentId, h);
      } else {
        const existingTime = new Date(existing.timestamp).getTime();
        const currentTime = new Date(h.timestamp).getTime();
        if (currentTime > existingTime) {
          mapLatest.set(h.instrumentId, h);
        }
      }
    }
    return mapLatest;
  }

  getStockBySymbol(symbol: string): Observable<StockRow | null> {
  return this.getStocks().pipe(
    map(stocks => stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase()) ?? null)
  );
}

getPriceHistoryBySymbol(symbol: string): Observable<HistoricalPricePoint[]> {
    const instrumentId$ = this.http.get<any[]>(`${this.baseUrl}/instruments`).pipe(
      map(instruments => instruments.find(inst => inst.tickerSymbol.toLowerCase() === symbol.toLowerCase())?.instrumentId)
    );
    return instrumentId$.pipe(
      switchMap(instrumentId => {
        if (instrumentId === undefined) {
          return of([]); 
        }
        
        return this.http.get<PriceHistory[]>(`${this.baseUrl}/priceHistories`).pipe(
          map(histories => 
            histories
              .filter(h => h.instrumentId === instrumentId)
              .map(h => ({
                timestamp: h.timestamp,
                price: h.price
              }))
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          )
        );
      })
    );
  }

}
