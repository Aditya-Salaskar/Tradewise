import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';

// Define the required interfaces
interface User { id: string; role: 'broker' | 'investor' | 'admin'; username: string; name: string; }
interface OrderRecord { id: string; investorId: string; instrumentId: number; orderType: 'BUY' | 'SELL'; quantity: number; price: number; status: string; timestamp: string; }
interface PortfolioHolding { investorId: string; quantityHeld: number; averageCostPrice: number; instrumentId: number; }
interface Instrument { instrumentId: number; tickerSymbol: string; }

// Interface for the Client Overview section
interface ClientDisplay {
    id: string;
    name: string;
    portfolioValue: number;
    todaysOrders: number;
    status: 'ACTIVE' | 'INACTIVE';
}

// Interface for the Orders section
interface OrderDisplay {
    orderId: string;
    client: string; // Client's name
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: string;
    investorId: string; // Used for actions
}


@Injectable({ providedIn: 'root' })
export class BrokerDashboardService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    // --- Core Data Fetching ---

    private getInvestors(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users?role=investor`).pipe(catchError(() => of([])));
    }
    
    // Note: This fetches ALL orders, which should be sufficient for a single broker/small system
    private getAllOrders(): Observable<OrderRecord[]> {
        return this.http.get<OrderRecord[]>(`${this.apiUrl}/orders`).pipe(catchError(() => of([])));
    }

    private getPortfolios(): Observable<PortfolioHolding[]> {
        return this.http.get<PortfolioHolding[]>(`${this.apiUrl}/portfolios`).pipe(catchError(() => of([])));
    }

    private getInstruments(): Observable<Instrument[]> {
        return this.http.get<Instrument[]>(`${this.apiUrl}/instruments`).pipe(catchError(() => of([])));
    }

    // --- Dashboard Methods ---

    getStats(): Observable<any> {
        return forkJoin({
            investors: this.getInvestors(),
            orders: this.getAllOrders()
        }).pipe(
            map(data => {
                const today = new Date().toDateString();
                const todayOrders = data.orders.filter(o => new Date(o.timestamp).toDateString() === today);
                
                // Simplified calculation for demo: Assuming all executed orders yield 0.1% commission
                const todaysVolume = todayOrders.filter(o => o.status === 'EXECUTED').reduce((sum, o) => sum + (o.quantity * o.price), 0);
                const todaysCommission = todaysVolume * 0.001; // 0.1% commission

                return {
                    totalClients: data.investors.length,
                    activeOrders: data.orders.filter(o => o.status === 'PENDING').length,
                    todaysVolume: parseFloat(todaysVolume.toFixed(2)),
                    todaysCommission: parseFloat(todaysCommission.toFixed(2))
                };
            }),
            catchError(() => of({ totalClients: 0, activeOrders: 0, todaysVolume: 0, todaysCommission: 0 }))
        );
    }

    getClients(): Observable<ClientDisplay[]> {
        return forkJoin({
            investors: this.getInvestors(),
            orders: this.getAllOrders(),
            portfolios: this.getPortfolios()
        }).pipe(
            map(data => {
                const ordersByClient = data.orders.reduce((acc, o) => {
                    acc[o.investorId] = (acc[o.investorId] || 0) + 1;
                    return acc;
                }, {} as { [key: string]: number });
                
                const portfolioValueByClient = data.portfolios.reduce((acc, p) => {
                    // For a simple aggregate, use quantity * avgPrice (invested value)
                    acc[p.investorId] = (acc[p.investorId] || 0) + (p.quantityHeld * p.averageCostPrice);
                    return acc;
                }, {} as { [key: string]: number });
                
                const today = new Date().toDateString();

                return data.investors.map(investor => {
                    const todayOrders = data.orders.filter(o => o.investorId === investor.id && new Date(o.timestamp).toDateString() === today).length;
                    
                    return {
                        id: investor.id,
                        name: investor.name || investor.username,
                        portfolioValue: parseFloat((portfolioValueByClient[investor.id] || 0).toFixed(2)),
                        todaysOrders: todayOrders,
                        status: todayOrders > 0 ? 'ACTIVE' : 'INACTIVE' as 'ACTIVE' | 'INACTIVE'
                    };
                }).sort((a, b) => b.todaysOrders - a.todaysOrders);
            }),
            catchError(() => of([]))
        );
    }

    getOrders(limit = 10): Observable<OrderDisplay[]> {
        return forkJoin({
            orders: this.getAllOrders(),
            investors: this.getInvestors(),
            instruments: this.getInstruments()
        }).pipe(
            map(data => {
                const investorMap = new Map(data.investors.map(i => [i.id, i.name || i.username]));
                const instrumentMap = new Map(data.instruments.map(i => [i.instrumentId, i.tickerSymbol]));

                // Sort by time and limit the list
                const recentOrders = data.orders
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, limit);

                return recentOrders.map(o => ({
                    orderId: o.id,
                    client: investorMap.get(o.investorId) || 'Unknown',
                    symbol: instrumentMap.get(o.instrumentId) || 'N/A',
                    type: o.orderType,
                    quantity: o.quantity,
                    price: o.price,
                    status: o.status,
                    investorId: o.investorId
                }));
            }),
            catchError(() => of([]))
        );
    }
}