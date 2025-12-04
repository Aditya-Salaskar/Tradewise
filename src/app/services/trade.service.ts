import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';

export interface MarketOffer {
  id?: number;
  instrument: string;
  availableQuantity: number;
  price: number;
  type: 'SELL' | 'BUY'; // market side
  timestamp?: string;
}

export interface BoughtTrade {
  id?: number;
  instrument: string;
  quantity: number;
  price: number;
  status: 'BOUGHT' | 'SOLD';
  timestamp?: string;
}

export interface OrderRecord {
  id?: number;
  orderId: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class TradeService {
  private base = 'http://localhost:3000';
  private marketCollection = 'marketOffers';
  private boughtCollection = 'boughtTrades';
  private investorOrderCollection = 'Investororders';

  constructor(private http: HttpClient) {}

  listMarketOffers(): Observable<MarketOffer[]> {
    return this.http.get<MarketOffer[]>(`${this.base}/${this.marketCollection}`);
  }

  listBoughtTrades(): Observable<BoughtTrade[]> {
    return this.http.get<BoughtTrade[]>(`${this.base}/${this.boughtCollection}`);
  }

  instruments(): Observable<string[]> {
    return this.listMarketOffers().pipe(
      map(list => Array.from(new Set((list || []).map(i => i.instrument))).sort())
    );
  }

  // Buy from a market offer (or place limit -> treated same for mock)
  buy(instrument: string, orderType: 'MARKET' | 'LIMIT', quantity: number, price?: number): Observable<BoughtTrade> {
    const timestamp = new Date().toISOString();
    const payload: BoughtTrade = {
      instrument,
      quantity,
      price: price ?? 0,
      status: 'BOUGHT',
      timestamp
    };

    // create bought trade record
    return this.http.post<BoughtTrade>(`${this.base}/${this.boughtCollection}`, payload).pipe(
      // also create Investororders record for audit/compliance
      map(created => {
        const order: OrderRecord = {
          orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          instrument,
          type: 'BUY',
          quantity,
          price: payload.price,
          status: 'EXECUTED',
          timestamp
        };
        // fire-and-forget investor order creation
        this.http.post(`${this.base}/${this.investorOrderCollection}`, order).subscribe({ error: () => {} });
        return created;
      })
    );
  }

  // Buy a given market offer id: optionally reduce quantity on marketOffers
  buyOffer(offer: MarketOffer, quantity: number, orderType: 'MARKET' | 'LIMIT', price?: number) {
    // post bought record then patch market offer availableQuantity
    return this.buy(offer.instrument, orderType, quantity, orderType === 'MARKET' ? offer.price : price).pipe(
      map(created => {
        const remaining = Math.max(0, (offer.availableQuantity || 0) - quantity);
        // update market offer
        this.http.patch(`${this.base}/${this.marketCollection}/${offer.id}`, { availableQuantity: remaining }).subscribe({ error: () => {} });
        return created;
      })
    );
  }

  // Sell a bought trade: mark as SOLD and create Investororders SELL record
  sellBoughtTrade(bought: BoughtTrade): Observable<BoughtTrade> {
    const timestamp = new Date().toISOString();
    // mark bought trade as SOLD
    return this.http.patch<BoughtTrade>(`${this.base}/${this.boughtCollection}/${bought.id}`, { status: 'SOLD' }).pipe(
      map(updated => {
        const order: OrderRecord = {
          orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          instrument: bought.instrument,
          type: 'SELL',
          quantity: bought.quantity,
          price: bought.price,
          status: 'EXECUTED',
          timestamp
        };
        this.http.post(`${this.base}/${this.investorOrderCollection}`, order).subscribe({ error: () => {} });
        return updated;
      })
    );
  }
}