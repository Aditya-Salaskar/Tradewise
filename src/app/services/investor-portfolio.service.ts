
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:3000'; // ✅ JSON Server port

  constructor(private http: HttpClient) {}

  // Fetch holdings
  getHoldings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/holdings`);
  this.http.get<any[]>(`${this.apiUrl}/orders`);
  }
  
 // ✅ Fetch orders
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }


  // Portfolio summary
  getPortfolioSummary(): Observable<{ totalValue: number; totalGainLoss: number; holdings: any[] }> {
    return this.getHoldings().pipe(
      map(holdings => {
        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
        const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
        return { totalValue, totalGainLoss, holdings };
           })
    );
  }

  // Fetch both holdings and orders together
  getPortfolioData(): Observable<{ holdings: any[]; orders: any[] }> {
    return forkJoin({
      holdings: this.getHoldings(),
      orders: this.getOrders()
    });
  }
}