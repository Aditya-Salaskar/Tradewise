
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

interface RawOrder {
    id: string;
    investorId: string;
    instrumentId: number;
    orderType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';
    timestamp: string;
}

interface Instrument {
    instrumentId: number;
    tickerSymbol: string;
    companyName: string;
    id: string;
}

interface DisplayOrder extends RawOrder {
    orderId: string;
    instrument: string;
    type: 'BUY' | 'SELL';
}

@Injectable({ providedIn: 'root' })
export class BrokerOrderService {
    private baseUrl = 'http://localhost:3000';
    private ordersCollection = 'orders';
    private instrumentsCollection = 'instruments';

    constructor(private http: HttpClient) {}

    /** ✅ Fetch all orders for broker (no investor filter) */
    listAllOrders(): Observable<DisplayOrder[]> {
        const orders$ = this.http.get<RawOrder[]>(`${this.baseUrl}/${this.ordersCollection}`);
        const instruments$ = this.http.get<Instrument[]>(`${this.baseUrl}/${this.instrumentsCollection}`);

        return forkJoin({ orders: orders$, instruments: instruments$ }).pipe(
            map(data => {
                const instrumentMap = new Map<number, Instrument>();
                data.instruments.forEach(i => instrumentMap.set(i.instrumentId, i));

                return data.orders.map(order => {
                    const instrument = instrumentMap.get(order.instrumentId);
                    return {
                        ...order,
                        orderId: order.id,
                        instrument: instrument?.tickerSymbol || 'N/A',
                        type: order.orderType
                    } as DisplayOrder;
                });
            })
        );
    }

    /** ✅ Cancel order by ID */
    cancelByOrderId(orderId: string): Observable<RawOrder> {
        return this.http.patch<RawOrder>(
            `${this.baseUrl}/${this.ordersCollection}/${orderId}`,
            { status: 'CANCELLED' }
        );
    }
    
updateOrderStatus(orderId: string, status: 'EXECUTED' | 'DECLINED' | 'CANCELLED'): Observable<RawOrder> {
  return this.http.patch<RawOrder>(
    `${this.baseUrl}/${this.ordersCollection}/${orderId}`,
    { status }
  );
}

}
