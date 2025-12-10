import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { Order } from '../models/order-record.model';

export interface MarketData {
    symbol: string;
    currentPrice: number;
    dayHigh: number;
    dayLow: number;
    volume: number;
}

@Injectable({ providedIn: 'root' })
export class TradeService {
  private base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  instruments(): Observable<string[]> {
    return this.http.get<any[]>(`${this.base}/instruments`).pipe(
        map(instruments => instruments.map(i => i.tickerSymbol).sort())
    );
  }

  getInstrumentId(symbol: string): Observable<number | undefined> {
        if (!symbol) return of(undefined);
        return this.http.get<any[]>(`${this.base}/instruments?tickerSymbol=${symbol}`).pipe(
            map(instruments => instruments.length > 0 ? instruments[0].instrumentId : undefined)
        );
    }

  placeOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(`${this.base}/orders`, order);
    }

  getMarketDataBySymbol(symbol: string): Observable<MarketData | null> {
        if (!symbol) return of(null);
        
        const symbolLower = symbol.toLowerCase();
        
        const instruments$ = this.http.get<any[]>(`${this.base}/instruments`);
        const priceHistories$ = this.http.get<any[]>(`${this.base}/priceHistories`);
        
        return forkJoin({ instruments: instruments$, histories: priceHistories$ }).pipe(
            map(data => {
                const instrument = data.instruments.find(i => i.tickerSymbol.toLowerCase() === symbolLower);
                
                if (!instrument) return null;
                
                const relevantHistory = data.histories.filter(h => h.instrumentId === instrument.instrumentId);
                
                if (relevantHistory.length === 0) {
                     return { 
                        symbol: instrument.tickerSymbol, 
                        currentPrice: 0, 
                        dayHigh: 0, 
                        dayLow: 0, 
                        volume: 0 
                     } as MarketData;
                }

                const prices = relevantHistory.map(h => h.price);
                const currentPrice = prices[prices.length - 1];
                const dayHigh = Math.max(...prices);
                const dayLow = Math.min(...prices);
                const totalVolume = relevantHistory.reduce((sum, h) => sum + (h.volume || 0), 0);
                
                return {
                    symbol: instrument.tickerSymbol,
                    currentPrice,
                    dayHigh,
                    dayLow,
                    volume: totalVolume,
                } as MarketData;
            })
        );
    }
}