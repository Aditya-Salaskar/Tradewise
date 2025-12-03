
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';

export interface Client {
  id: string;
  name: string;
  portfolioValue: number | string;
  todaysOrders: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Order {
  // JSON Server item should have a numeric `id` for REST path
  // plus your business key `orderId`.
  id: number;              // ✅ numeric resource id used by JSON Server
  orderId: string;         // ✅ business key used in UI
  client: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number | string;  // may be "₹1,000.50"
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL

  constructor(private http: HttpClient) {}

  // ---------- Reads ----------
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  // ---------- Updates ----------
  /** Approve an order by setting status = EXECUTED */
  approveOrder(orderId: string): Observable<void> {
    return this.findOrderResourceId(orderId).pipe(
      switchMap((resourceId: number) =>
        this.http.patch(`${this.apiUrl}/orders/${resourceId}`, { status: 'EXECUTED' })
      ),
      map(() => void 0)
    );
  }

  /** Reject an order by setting status = CANCELLED */
  rejectOrder(orderId: string): Observable<void> {
    return this.findOrderResourceId(orderId).pipe(
      switchMap((resourceId: number) =>
        this.http.patch(`${this.apiUrl}/orders/${resourceId}`, { status: 'CANCELLED' })
      ),
      map(() => void 0)
    );
  }

  // ---------- Helper ----------
  /**
   * JSON Server needs the numeric `id` in the path (/orders/:id).
   * If you only have `orderId` in the UI, we look up the resource's numeric `id`.
   */
  private findOrderResourceId(orderId: string): Observable<number> {
    return this.http
      .get<Order[]>(`${this.apiUrl}/orders?orderId=${encodeURIComponent(orderId)}`)
      .pipe(
        map((rows) => {
          if (!rows.length) {
            throw new Error(`Order with orderId=${orderId} not found`);
          }
          const resourceId = rows[0].id; // ✅ typed as number
          if (resourceId == null) {
            throw new Error(
              `Matched order has no numeric id. Ensure each order in db.json has an "id" field.`
            );
          }
          return resourceId;
        })
      );
  }
}
