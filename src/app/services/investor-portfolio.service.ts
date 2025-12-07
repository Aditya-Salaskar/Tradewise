import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Assuming path to AuthService
import { MarketData } from './trade.service'; // Assuming MarketData interface is available

// Define the interfaces based on the new db.json structure
interface PortfolioHolding {
    id: string;
    investorId: string;
    instrumentId: number;
    quantityHeld: number;
    averageCostPrice: number;
}

interface Instrument {
    instrumentId: number;
    tickerSymbol: string;
    companyName: string;
    assetType: string; // Used for filtering (Equity, Bond, etc.)
}

interface PriceHistory {
    instrumentId: number;
    price: number;
    timestamp: string;
}

// Define the structure for the view (calculated data)
export interface DisplayHolding {
    id: string; // holding ID
    symbol: string;
    name: string;
    type: string;
    quantity: number; // quantityHeld
    avgPrice: number; // averageCostPrice
    currentPrice: number; // fetched from priceHistories
    value: number; // quantity * currentPrice
    invested: number; // quantity * avgPrice
    gainLoss: number; // value - invested
    gainLossPercent: number;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient, private authService: AuthService) {}

    // Helper to get the latest price for all instruments
    private getLatestPrices(instrumentIds: number[]): Observable<Map<number, number>> {
        // Fetch all price histories and find the latest price for the needed instruments.
        // In a real application, you would query only the latest price, but db.json-server 
        // requires fetching all and processing client-side.
        return this.http.get<PriceHistory[]>(`${this.apiUrl}/priceHistories`).pipe(
            map(histories => {
                const latestPrices = new Map<number, number>();
                const sortedHistories = histories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                for (const history of sortedHistories) {
                    if (instrumentIds.includes(history.instrumentId) && !latestPrices.has(history.instrumentId)) {
                        latestPrices.set(history.instrumentId, history.price);
                    }
                }
                return latestPrices;
            }),
            catchError(() => of(new Map<number, number>()))
        );
    }
    
    // ⭐ NEW: Fetch holdings for the current investor
    getHoldings(): Observable<DisplayHolding[]> {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'investor') {
            return of([]);
        }
        const investorId = currentUser.id!;

        const holdings$ = this.http.get<PortfolioHolding[]>(`${this.apiUrl}/portfolios?investorId=${investorId}&quantityHeld_gt=0`);
        const instruments$ = this.http.get<Instrument[]>(`${this.apiUrl}/instruments`);

        return forkJoin({ holdings: holdings$, instruments: instruments$ }).pipe(
            switchMap(data => {
                const holdingList = data.holdings;
                const instrumentMap = new Map<number, Instrument>();
                data.instruments.forEach(i => instrumentMap.set(i.instrumentId, i));

                const instrumentIds = holdingList.map(h => h.instrumentId);

                // Fetch latest prices for all held instruments
                return this.getLatestPrices(instrumentIds).pipe(
                    map(latestPriceMap => {
                        return holdingList.map(h => {
                            const instrument = instrumentMap.get(h.instrumentId);
                            const currentPrice = latestPriceMap.get(h.instrumentId) || h.averageCostPrice; // Fallback to avg price

                            const invested = h.quantityHeld * h.averageCostPrice;
                            const value = h.quantityHeld * currentPrice;
                            const gainLoss = value - invested;
                            const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;
                            
                            return {
                                id: h.id,
                                symbol: instrument?.tickerSymbol || 'N/A',
                                name: instrument?.companyName || 'N/A',
                                type: instrument?.assetType || 'Equity', // Default to Equity
                                quantity: h.quantityHeld,
                                avgPrice: h.averageCostPrice,
                                currentPrice: currentPrice,
                                invested: invested,
                                value: value,
                                gainLoss: parseFloat(gainLoss.toFixed(2)),
                                gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
                            } as DisplayHolding;
                        });
                    })
                );
            }),
            catchError(err => {
                console.error('Portfolio service error:', err);
                return of([]);
            })
        );
    }

    // ⭐ REVISED: Calculate summary based on the results of getHoldings
    getPortfolioSummary(): Observable<{ totalValue: number; totalGainLoss: number }> {
        return this.getHoldings().pipe(
            map(holdings => {
                const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
                const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
                return { 
                    totalValue: parseFloat(totalValue.toFixed(2)), 
                    totalGainLoss: parseFloat(totalGainLoss.toFixed(2)) 
                };
            })
        );
    }
}