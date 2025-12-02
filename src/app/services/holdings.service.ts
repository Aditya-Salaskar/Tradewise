
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HoldingsService {
  private holdingsUrl = 'assets/mock-data/holdings.json';

  constructor(private http: HttpClient) {}

  getHoldings(): Observable<any[]> {
    return this.http.get<any[]>(this.holdingsUrl);
  }
}