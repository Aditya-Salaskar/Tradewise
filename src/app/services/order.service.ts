import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface OrderDto {
  id?: number;
  orderId: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number | string;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
}

export interface Order {
  id?: number;
  orderId: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number | string;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:3000';
  private collection = 'Investororders';

  constructor(private http: HttpClient) {}

  private mapDto(dto: OrderDto): Order {
    return {
      ...dto,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date()
    };
  }

  list(): Observable<Order[]> {
    return this.http.get<OrderDto[]>(`${this.baseUrl}/${this.collection}`).pipe(
      map(arr => (arr || []).map(d => this.mapDto(d))),
      catchError(err => {
        console.error('OrderService.list error', err);
        return throwError(() => err);
      })
    );
  }

  getByOrderId(orderId: string): Observable<Order | undefined> {
    const q = encodeURIComponent(orderId);
    return this.http.get<OrderDto[]>(`${this.baseUrl}/${this.collection}?orderId=${q}`).pipe(
      map(arr => (arr && arr.length ? this.mapDto(arr[0]) : undefined)),
      catchError(err => {
        console.error('OrderService.getByOrderId error', err);
        return throwError(() => err);
      })
    );
  }

  cancelByOrderId(orderId: string): Observable<Order> {
    const q = encodeURIComponent(orderId);
    return this.http.get<OrderDto[]>(`${this.baseUrl}/${this.collection}?orderId=${q}`).pipe(
      switchMap(list => {
        if (!list || list.length === 0) {
          return throwError(() => new Error('Order not found'));
        }
        const item = list[0];
        return this.http.patch<OrderDto>(`${this.baseUrl}/${this.collection}/${item.id}`, { status: 'CANCELLED' }).pipe(
          map(updated => this.mapDto(updated))
        );
      }),
      catchError(err => {
        console.error('OrderService.cancelByOrderId error', err);
        return throwError(() => err);
      })
    );
  }

  // optional convenience: get distinct instruments for filter dropdown
  instruments(): Observable<string[]> {
    return this.list().pipe(
      map(list => Array.from(new Set(list.map(i => i.instrument))).sort()),
      catchError(() => of([]))
    );
  }
}