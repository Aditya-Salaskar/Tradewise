import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Define the core data structures used by the service
interface User { id: string; username: string; name: string; role: string; isLocked: boolean; }
interface OrderRecord { id: string; investorId: string; instrumentId: number; orderType: 'BUY' | 'SELL'; quantity: number; price: number; status: string; timestamp: string; }
// ⭐ ADD THE 'export' KEYWORD HERE
export interface RecentActivityItem {
  at: string | Date;
  type: 
    | 'ORDER_PLACED' 
    | 'ORDER_EXECUTED'
    | 'ORDER_REJECTED'
    | 'ORDER_CANCELLED'
    | 'USER_ACTION'
  description: string;
  by: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // --- Core Data Fetching ---

  private getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(catchError(() => of([])));
  }

  private getAllOrders(): Observable<OrderRecord[]> {
    return this.http.get<OrderRecord[]>(`${this.apiUrl}/orders`).pipe(catchError(() => of([])));
  }

  // --- Dashboard Methods ---

  /**
   * Fetches and calculates high-level statistics.
   */
  getStats(): Observable<{ totalUsers: number; lockedAccounts: number }> {
    return this.getAllUsers().pipe(
      map(users => ({
        totalUsers: users.length,
        lockedAccounts: users.filter(u => u.isLocked).length,
      })),
      catchError(() => of({ totalUsers: 0, lockedAccounts: 0 }))
    );
  }

  /**
   * Simulates recent admin activity by combining recent user logins/changes
   * and recent order status changes.
   */
  getRecentActivity(limit: number = 10): Observable<RecentActivityItem[]> {
    return forkJoin({
      users: this.getAllUsers(),
      orders: this.getAllOrders()
    }).pipe(
      map(data => {
        const activity: RecentActivityItem[] = [];

        // 1. Add Recent Order Activity (e.g., Placed or Executed)
        const recentOrders = data.orders
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10); // Take top 10 most recent orders

        const investorMap = new Map(data.users.map(u => [u.id, u.name || u.username]));

        recentOrders.forEach(order => {
          const clientName = investorMap.get(order.investorId) || order.investorId;
          
          activity.push({
            at: order.timestamp,
            type: `ORDER_${order.status}` as any, // ORDER_PENDING, ORDER_EXECUTED, etc.
            description: `${order.orderType} ${order.quantity} shares of [Instrument ID: ${order.instrumentId}] at $${order.price}`,
            by: clientName,
          });
        });

        // 2. Sort the combined list by timestamp and apply the final limit
        return activity
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
          .slice(0, limit);
      }),
      catchError(err => {
        console.error('Error fetching activity:', err);
        return of([]);
      })
    );
  }
}