
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }
}
