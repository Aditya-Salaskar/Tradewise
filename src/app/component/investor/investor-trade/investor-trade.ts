import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService, MarketData } from '../../../services/trade.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, take } from 'rxjs';
import { Order } from '../../../models/order-record.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-investor-trade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investor-trade.html',
  styleUrls: ['./investor-trade.css']
})
export class InvestorTrade implements OnInit {
  instruments: string[] = [];

  selectedInstrument = '';
  side: 'BUY' | 'SELL' = 'BUY';
  orderType: 'MARKET' | 'LIMIT' = 'MARKET';
  quantity = 1;
  price?: number;

  loadingMarketInfo = false;
  marketInfo$!: Observable<MarketData | null>;
  message = '';

  private initialSymbol: string | null = null;

  constructor(private tradeService: TradeService, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.tradeService.instruments().subscribe(list => {
      this.instruments = list;
    });

    this.marketInfo$ = this.route.queryParams.pipe(
      switchMap(params => {
        const symbol = params['symbol'] || this.selectedInstrument;
        this.selectedInstrument = symbol;
        return symbol ? this.tradeService.getMarketDataBySymbol(symbol) : [null];
      })
    );

  }

  onInstrumentChanged(): void {
    if (this.selectedInstrument) {
      this.marketInfo$ = this.tradeService.getMarketDataBySymbol(this.selectedInstrument);
    }
  }

  placeOrder(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'investor') {
        this.message = 'Authentication error: Please log in as an investor to place an order.';
        return;
    }
    const investorId: string = currentUser.id!;
    if (!this.selectedInstrument || !this.quantity || this.quantity <= 0) {
      this.message = 'Please select an instrument and specify a valid quantity.';
      return;
    }

    const confirmMessage = `Confirm ${this.side} order for ${this.quantity} shares of ${this.selectedInstrument}?`;
    if (!window.confirm(confirmMessage)) {
      this.message = 'Order cancelled by user.';
      return;
    }

    this.message = 'Placing order...';

    this.marketInfo$.pipe(take(1)).subscribe(marketInfo => {
        if (!marketInfo) {
            this.message = 'Could not retrieve market data. Order failed.';
            return;
        }

        const executionPrice = marketInfo.currentPrice;

        this.tradeService.getInstrumentId(this.selectedInstrument).pipe(take(1)).subscribe(instrumentId => {
            if (!instrumentId) {
                this.message = 'Instrument not found. Order failed.';
                return;
            }

            const newOrder: Order = {
                investorId: investorId,
                instrumentId: instrumentId,
                orderType: this.side,
                quantity: this.quantity,
                price: executionPrice,
                status: 'PENDING',
                timestamp: new Date().toISOString()
            };

            this.tradeService.placeOrder(newOrder).subscribe({
                next: (response) => {
                    this.message = `Order successfully placed! Order ID: ${response.id}`;
                    this.quantity = 1;
                },
                error: (err) => {
                    this.message = 'Order placement failed due to a server error.';
                    console.error('Order Error:', err);
                }
            });
        });

    });
  }

get estimatedPrice(): number {
    return this.orderType === 'MARKET' ? 0 : (this.price ?? 0);
  }
  get estimatedTotal(): number {
    return (this.estimatedPrice || 0) * (this.quantity || 0);
  }

}
