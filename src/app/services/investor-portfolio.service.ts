
import { Injectable } from '@angular/core';
import { HoldingsService } from './holdings.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  constructor(private holdingsService: HoldingsService) {}

  getPortfolioSummary(): Observable<{ totalValue: number; totalGainLoss: number; holdings: any[] }> {
    return this.holdingsService.getHoldings().pipe(
      map(holdings => {
        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
        const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
        return { totalValue, totalGainLoss, holdings };
           })
    );
  }
}