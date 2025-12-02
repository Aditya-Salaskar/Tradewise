
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestorService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getInvestorStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/investorStats`);
  }

  getHoldings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/holdings`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }

  addOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, order);
  }
}
