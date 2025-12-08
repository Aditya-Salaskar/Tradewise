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
  portfolioValue: number; // Calculated Live
  todaysOrders: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OrderDisplay {
  orderId: string;
  id: string; // Internal ID
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
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // --- Helper ---
  private parseMoney(value: any): number {
    if (typeof value === 'number') return value;
    return Number(String(value).replace(/[^\d.-]/g, '')) || 0;
  }

  // ==========================================
  // 1. DATA FETCHING
  // ==========================================

  getClients(): Observable<ClientDisplay[]> {
    return forkJoin({
      users: this.http.get<User[]>(`${this.apiUrl}/users?role=investor`),
      orders: this.http.get<OrderRecord[]>(`${this.apiUrl}/orders`),
      // We MUST fetch portfolios to calculate the REAL value
      portfolios: this.http.get<PortfolioHolding[]>(`${this.apiUrl}/portfolios`) 
    }).pipe(
      map(data => {
        // 1. Calculate Portfolio Value per Investor dynamically
        // This ensures that when you Approve an order, this value updates automatically
        const portfolioValueMap = new Map<string, number>();
        
        data.portfolios.forEach(p => {
          const currentVal = portfolioValueMap.get(p.investorId) || 0;
          // Value = Quantity * Cost (Simple calculation)
          portfolioValueMap.set(p.investorId, currentVal + (p.quantityHeld * p.averageCostPrice));
        });

        // 2. Count Orders
        const orderCountMap = new Map<string, number>();
        data.orders.forEach(o => {
          const count = orderCountMap.get(o.investorId) || 0;
          orderCountMap.set(o.investorId, count + 1);
        });

        // 3. Map Users to Display
        return data.users.map(u => ({
          id: u.id,
          name: u.fullName || u.username,
          // READ FROM CALCULATED MAP, NOT STATIC USER DATA
          portfolioValue: parseFloat((portfolioValueMap.get(u.id) || 0).toFixed(2)),
          todaysOrders: orderCountMap.get(u.id) || 0,
          status: 'ACTIVE'
        }));
      })
    );
  }

  getOrders(): Observable<OrderDisplay[]> {
    return forkJoin({
      orders: this.http.get<OrderRecord[]>(`${this.apiUrl}/orders`),
      users: this.http.get<User[]>(`${this.apiUrl}/users?role=investor`),
      instruments: this.http.get<Instrument[]>(`${this.apiUrl}/instruments`)
    }).pipe(
      map(data => {
        const userMap = new Map(data.users.map(u => [u.id, u.fullName || u.username]));
        const instrumentMap = new Map(data.instruments.map(i => [i.instrumentId, i.tickerSymbol]));

        return data.orders.map(o => ({
          orderId: o.id, // Display ID
          id: o.id,      // Internal ID used for API calls
          client: userMap.get(o.investorId) || 'Unknown',
          symbol: instrumentMap.get(o.instrumentId) || 'N/A',
          type: o.orderType,
          quantity: o.quantity,
          price: o.price,
          status: o.status,
          investorId: o.investorId
        })).sort((a, b) => b.orderId.localeCompare(a.orderId)); // Newest first
      })
    );
  }

  getStats(): Observable<DashboardStats> {
    return this.getOrders().pipe(
      map(orders => {
        const pending = orders.filter(o => o.status === 'PENDING').length;
        // Volume = Sum of Executed Orders
        const volume = orders
          .filter(o => o.status === 'EXECUTED')
          .reduce((sum, o) => sum + (o.quantity * o.price), 0);
        
        // Total Clients (Simple count of unique clients in orders + db check)
        const uniqueClients = new Set(orders.map(o => o.client)).size;

        return {
          totalClients: uniqueClients, 
          activeOrders: pending,
          todaysVolume: volume,
          todaysCommission: volume * 0.001
        };
      })
    );
  }

  // ==========================================
  // 2. APPROVE / REJECT LOGIC
  // ==========================================

  approveOrder(orderId: string): Observable<any> {
    // 1. Fetch the Order details
    return this.http.get<OrderRecord>(`${this.apiUrl}/orders/${orderId}`).pipe(
      switchMap(order => {
        // 2. Find if the investor already holds this instrument
        return this.http.get<PortfolioHolding[]>(
          `${this.apiUrl}/portfolios?investorId=${order.investorId}&instrumentId=${order.instrumentId}`
        ).pipe(
          switchMap(holdings => {
            let portfolioAction$;

            if (holdings.length > 0) {
              // CASE A: Holding exists -> Update Quantity
              const holding = holdings[0];
              let newQty = holding.quantityHeld;

              if (order.orderType === 'BUY') {
                newQty += Number(order.quantity);
              } else if (order.orderType === 'SELL') {
                newQty -= Number(order.quantity);
              }

              // Update the portfolio entry
              portfolioAction$ = this.http.patch(`${this.apiUrl}/portfolios/${holding.id}`, {
                quantityHeld: newQty < 0 ? 0 : newQty
              });
            } else {
              // CASE B: Holding does not exist
              if (order.orderType === 'BUY') {
                // Create new portfolio entry
                const newHolding = {
                  investorId: order.investorId,
                  instrumentId: order.instrumentId,
                  quantityHeld: Number(order.quantity),
                  averageCostPrice: Number(order.price)
                };
                portfolioAction$ = this.http.post(`${this.apiUrl}/portfolios`, newHolding);
              } else {
                // Trying to sell something they don't have? Do nothing to portfolio.
                portfolioAction$ = of(null);
              }
            }

            // 3. Mark Order as EXECUTED
            const orderAction$ = this.http.patch(`${this.apiUrl}/orders/${orderId}`, { status: 'EXECUTED' });

            // Run both actions
            return forkJoin([orderAction$, portfolioAction$]);
          })
        );
      })
    );
  }

  rejectOrder(orderId: string): Observable<any> {
    // Logic: Just mark as CANCELLED. Do NOT touch portfolio.
    return this.http.patch(`${this.apiUrl}/orders/${orderId}`, { status: 'CANCELLED' });
  }

  // --- Mock Investor Methods to prevent build errors ---
  getPortfolioSummary(userId: string): Observable<any> { return of({}); }
  getTopHoldings(userId: string, limit: number): Observable<any[]> { return of([]); }
  getRecentOrders(userId: string, limit: number): Observable<any[]> { return of([]); }
}