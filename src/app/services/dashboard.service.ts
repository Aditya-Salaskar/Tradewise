import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// --- Interfaces ---
export interface User { id: string; role: string; username: string; name: string; fullName?: string; }
export interface OrderRecord { id: string; investorId: string; instrumentId: number; orderType: 'BUY' | 'SELL'; quantity: number; price: number; status: string; timestamp: string; }
export interface PortfolioHolding { id?: string; investorId: string; quantityHeld: number; averageCostPrice: number; instrumentId: number; }
export interface Instrument { instrumentId: number; tickerSymbol: string; }

export interface ClientDisplay {
  id: string;
  name: string;
  portfolioValue: number;
  todaysOrders: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OrderDisplay {
  orderId: string;
  client: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: string;
  investorId: string;
}

export interface DashboardStats {
  totalClients: number;
  activeOrders: number;
  todaysVolume: number;
  todaysCommission: number;
}

@Injectable({
  providedIn: 'root',
})
// ✅ Class name is DashboardService (matches file name)
export class DashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // --- Helper ---
  private parseMoney(value: any): number {
    if (typeof value === 'number') return value;
    return Number(String(value).replace(/[^\d.-]/g, '')) || 0;
  }

  // --- INTERNAL FETCHERS ---
  private getInvestors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?role=investor`).pipe(catchError(() => of([])));
  }

  private getAllOrders(): Observable<OrderRecord[]> {
    return this.http.get<OrderRecord[]>(`${this.apiUrl}/orders`).pipe(catchError(() => of([])));
  }

  private getPortfolios(): Observable<PortfolioHolding[]> {
    return this.http.get<PortfolioHolding[]>(`${this.apiUrl}/portfolios`).pipe(catchError(() => of([])));
  }

  private getInstruments(): Observable<Instrument[]> {
    return this.http.get<Instrument[]>(`${this.apiUrl}/instruments`).pipe(catchError(() => of([])));
  }

  // --- BROKER DASHBOARD METHODS ---

  getStats(): Observable<DashboardStats> {
    return forkJoin({
      investors: this.getInvestors(),
      orders: this.getAllOrders()
    }).pipe(
      map(data => {
        const pending = data.orders.filter(o => o.status === 'PENDING').length;
        const executed = data.orders.filter(o => o.status === 'EXECUTED');
        const volume = executed.reduce((sum, o) => sum + (o.quantity * o.price), 0);

        return {
          totalClients: data.investors.length,
          activeOrders: pending,
          todaysVolume: parseFloat(volume.toFixed(2)),
          todaysCommission: parseFloat((volume * 0.001).toFixed(2))
        };
      })
    );
  }

  getClients(): Observable<ClientDisplay[]> {
    return forkJoin({
      investors: this.getInvestors(),
      orders: this.getAllOrders(),
      portfolios: this.getPortfolios()
    }).pipe(
      map(data => {
        const portValueMap = new Map<string, number>();
        data.portfolios.forEach(p => {
          const current = portValueMap.get(p.investorId) || 0;
          portValueMap.set(p.investorId, current + (p.quantityHeld * p.averageCostPrice));
        });

        const orderCountMap = new Map<string, number>();
        const today = new Date().toDateString();

        data.orders.forEach(o => {
          if (new Date(o.timestamp).toDateString() === today) {
            const count = orderCountMap.get(o.investorId) || 0;
            orderCountMap.set(o.investorId, count + 1);
          }
        });

        return data.investors.map(inv => ({
          id: inv.id,
          name: inv.fullName || inv.username,
          portfolioValue: parseFloat((portValueMap.get(inv.id) || 0).toFixed(2)),
          todaysOrders: orderCountMap.get(inv.id) || 0,
          status: (orderCountMap.get(inv.id) || 0) > 0 ? 'ACTIVE' : 'INACTIVE'
        }));
      })
    );
  }

  getOrders(limit = 20): Observable<OrderDisplay[]> {
    return forkJoin({
      orders: this.getAllOrders(),
      investors: this.getInvestors(),
      instruments: this.getInstruments()
    }).pipe(
      map(data => {
        const userMap = new Map(data.investors.map(u => [u.id, u.fullName || u.username]));
        const instrumentMap = new Map(data.instruments.map(i => [i.instrumentId, i.tickerSymbol]));

        const sorted = data.orders.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return sorted.slice(0, limit).map(o => ({
          orderId: o.id,
          client: userMap.get(o.investorId) || 'Unknown',
          symbol: instrumentMap.get(o.instrumentId) || 'Unknown',
          type: o.orderType,
          quantity: o.quantity,
          price: o.price,
          status: o.status,
          investorId: o.investorId
        }));
      })
    );
  }

  approveOrder(orderId: string): Observable<any> {
    return this.http.get<OrderRecord>(`${this.apiUrl}/orders/${orderId}`).pipe(
      switchMap(order => {
        return this.http.get<PortfolioHolding[]>(
          `${this.apiUrl}/portfolios?investorId=${order.investorId}&instrumentId=${order.instrumentId}`
        ).pipe(
          switchMap(portfolios => {
            let portfolioUpdate$;
            if (portfolios.length > 0) {
              const pf = portfolios[0];
              const newQty = order.orderType === 'BUY'
                ? pf.quantityHeld + order.quantity
                : pf.quantityHeld - order.quantity;

              portfolioUpdate$ = this.http.patch(`${this.apiUrl}/portfolios/${pf.id}`, {
                quantityHeld: newQty < 0 ? 0 : newQty
              });
            } else {
              if (order.orderType === 'BUY') {
                const newPf = {
                  investorId: order.investorId,
                  instrumentId: order.instrumentId,
                  quantityHeld: order.quantity,
                  averageCostPrice: order.price
                };
                portfolioUpdate$ = this.http.post(`${this.apiUrl}/portfolios`, newPf);
              } else {
                portfolioUpdate$ = of(null);
              }
            }
            const orderUpdate$ = this.http.patch(`${this.apiUrl}/orders/${orderId}`, { status: 'EXECUTED' });
            return forkJoin([orderUpdate$, portfolioUpdate$]);
          })
        );
      })
    );
  }

  rejectOrder(orderId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${orderId}`, { status: 'CANCELLED' });
  }

  // --- INVESTOR DASHBOARD METHODS (Stubbed for now to prevent errors) ---

  getPortfolioSummary(userId: string): Observable<any> {
    // Mock return to satisfy investor dashboard until fully implemented
    return of({ portfolioValue: 0, totalOrders: 0, profitLoss: 0, availableBalance: 0 });
  }

  getTopHoldings(userId: string, limit: number): Observable<any[]> {
    return of([]);
  }

  getRecentOrders(userId: string, limit: number): Observable<any[]> {
    return of([]);
  }
}
