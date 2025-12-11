import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, switchMap, map, catchError } from 'rxjs';

// --- Interfaces based on your db.json ---
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
  orderId: string;     // The ID from db.json (e.g. "o1001")
  client: string;      // The resolved name
  symbol: string;      // The resolved ticker
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: string;
  investorId: string;
}

@Injectable({ providedIn: 'root' })
export class BrokerDashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ==============================================================
  // 1. DATA FETCHING
  // ==============================================================

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

  // --- Main Dashboard Data Streams ---

  getStats(): Observable<any> {
    return forkJoin({
      investors: this.getInvestors(),
      orders: this.getAllOrders()
    }).pipe(
      map(data => {
        // Simple stats calculation
        const pending = data.orders.filter(o => o.status === 'PENDING').length;
        const executed = data.orders.filter(o => o.status === 'EXECUTED');

        const volume = executed.reduce((sum, o) => sum + (o.quantity * o.price), 0);
        const commission = volume * 0.001; // 0.1%

        return {
          totalClients: data.investors.length,
          activeOrders: pending,
          todaysVolume: volume,
          todaysCommission: commission
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
        // Calculate portfolio value per investor
        const portValueMap = new Map<string, number>();
        data.portfolios.forEach(p => {
          const currentVal = portValueMap.get(p.investorId) || 0;
          // Simplified: Value = Qty * Cost (In real app, multiply by current market price)
          portValueMap.set(p.investorId, currentVal + (p.quantityHeld * p.averageCostPrice));
        });

        // Count orders
        const orderCountMap = new Map<string, number>();
        data.orders.forEach(o => {
          const count = orderCountMap.get(o.investorId) || 0;
          orderCountMap.set(o.investorId, count + 1);
        });

        return data.investors.map(inv => ({
          id: inv.id,
          name: inv.fullName || inv.username, // Prefer Full Name
          portfolioValue: portValueMap.get(inv.id) || 0,
          todaysOrders: orderCountMap.get(inv.id) || 0,
          status: 'ACTIVE' // Simplified status logic
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
        // Create lookup maps for fast access
        const userMap = new Map(data.investors.map(u => [u.id, u.fullName || u.username]));
        const instrumentMap = new Map(data.instruments.map(i => [i.instrumentId, i.tickerSymbol]));

        // Sort by timestamp descending (newest first)
        const sorted = data.orders.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return sorted.slice(0, limit).map(o => ({
          orderId: o.id,
          client: userMap.get(o.investorId) || 'Unknown Client', // Resolves ID to Name
          symbol: instrumentMap.get(o.instrumentId) || 'Unknown Symbol', // Resolves ID to Ticker
          type: o.orderType,
          quantity: o.quantity,
          price: o.price,
          status: o.status,
          investorId: o.investorId
        }));
      })
    );
  }

  // ==============================================================
  // 2. ACTIONS (Approve / Reject)
  // ==============================================================

  approveOrder(orderId: string): Observable<any> {
    // 1. Get the order details first
    return this.http.get<OrderRecord>(`${this.apiUrl}/orders/${orderId}`).pipe(
      switchMap(order => {
        // 2. Find if portfolio entry exists for this user + instrument
        return this.http.get<PortfolioHolding[]>(
          `${this.apiUrl}/portfolios?investorId=${order.investorId}&instrumentId=${order.instrumentId}`
        ).pipe(
          switchMap(portfolios => {
            let portfolioUpdate$;

            if (portfolios.length > 0) {
              // Entry exists -> Update Quantity
              const pf = portfolios[0];
              const newQty = order.orderType === 'BUY'
                ? pf.quantityHeld + order.quantity
                : pf.quantityHeld - order.quantity;

              // Prevent negative holdings
              const finalQty = newQty < 0 ? 0 : newQty;

              portfolioUpdate$ = this.http.patch(`${this.apiUrl}/portfolios/${pf.id}`, {
                quantityHeld: finalQty
              });
            } else {
              // Entry does not exist -> Create it (Only for BUY)
              if (order.orderType === 'BUY') {
                const newPf = {
                  investorId: order.investorId,
                  instrumentId: order.instrumentId,
                  quantityHeld: order.quantity,
                  averageCostPrice: order.price // Simplified Avg Price logic
                };
                portfolioUpdate$ = this.http.post(`${this.apiUrl}/portfolios`, newPf);
              } else {
                // Selling something they don't have? Just return null or error.
                portfolioUpdate$ = of(null);
              }
            }

            // 3. Update Order Status to EXECUTED
            const orderUpdate$ = this.http.patch(`${this.apiUrl}/orders/${orderId}`, { status: 'EXECUTED' });

            // Run both updates
            return forkJoin([orderUpdate$, portfolioUpdate$]);
          })
        );
      })
    );
  }

  rejectOrder(orderId: string): Observable<any> {
    // Just update status to CANCELLED
    return this.http.patch(`${this.apiUrl}/orders/${orderId}`, { status: 'CANCELLED' });
  }
}
