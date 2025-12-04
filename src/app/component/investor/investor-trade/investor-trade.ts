import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService, MarketOffer, BoughtTrade } from '../../../services/trade.service';

@Component({
  selector: 'app-investor-trade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investor-trade.html',
  styleUrls: ['./investor-trade.css']
})
export class InvestorTrade implements OnInit {
  marketOffers: MarketOffer[] = [];
  boughtTrades: BoughtTrade[] = [];
  instruments: string[] = [];

  // Form model
  selectedInstrument = '';
  side: 'BUY' | 'SELL' = 'BUY';
  orderType: 'MARKET' | 'LIMIT' = 'MARKET';
  quantity = 1;
  price?: number;

  loadingMarket = true;
  loadingBought = true;
  message = '';

  constructor(private tradeService: TradeService) {}

  ngOnInit(): void {
    this.loadMarket();
    this.loadBought();
    this.tradeService.instruments().subscribe(list => this.instruments = list);
  }

  loadMarket(): void {
    this.loadingMarket = true;
    this.tradeService.listMarketOffers().subscribe({
      next: data => { this.marketOffers = data || []; this.loadingMarket = false; },
      error: () => { this.marketOffers = []; this.loadingMarket = false; }
    });
  }

  loadBought(): void {
    this.loadingBought = true;
    this.tradeService.listBoughtTrades().subscribe({
      next: data => { this.boughtTrades = data || []; this.loadingBought = false; },
      error: () => { this.boughtTrades = []; this.loadingBought = false; }
    });
  }

  placeOrder(): void {
    if (!this.selectedInstrument) { this.message = 'Select instrument'; return; }
    if (!this.quantity || this.quantity <= 0) { this.message = 'Enter quantity'; return; }
    if (this.orderType === 'LIMIT' && (this.price === undefined || this.price <= 0)) { this.message = 'Enter limit price'; return; }

    this.message = 'Placing order...';
    // For this module main flow: BUY creates a bought trade
    if (this.side === 'BUY') {
      this.tradeService.buy(this.selectedInstrument, this.orderType, this.quantity, this.orderType === 'LIMIT' ? this.price : undefined)
        .subscribe({
          next: () => { this.message = 'Buy executed'; this.loadBought(); this.tradeService.instruments().subscribe(); },
          error: () => { this.message = 'Buy failed'; }
        });
    } else {
      // SELL: attempt to create a sell order record (for simplicity we create an Investororders SELL)
      // Find existing bought trade matching instrument and available quantity
      const owned = this.boughtTrades.find(b => b.instrument === this.selectedInstrument && b.status === 'BOUGHT' && b.quantity >= this.quantity);
      if (!owned) { this.message = 'No sufficient bought position to sell'; return; }
      this.tradeService.sellBoughtTrade(owned).subscribe({
        next: () => { this.message = 'Sell executed'; this.loadBought(); },
        error: () => { this.message = 'Sell failed'; }
      });
    }
  }

  buyFromMarket(offer: MarketOffer): void {
    if (!offer || offer.availableQuantity <= 0) { this.message = 'No quantity available'; return; }
    const qty = Math.min( offer.availableQuantity, 1 );
    this.message = 'Buying from market...';
    this.tradeService.buyOffer(offer, qty, 'MARKET').subscribe({
      next: () => { this.message = 'Bought from market'; this.loadMarket(); this.loadBought(); },
      error: () => { this.message = 'Buy failed'; }
    });
  }

  sellBought(b: BoughtTrade): void {
    if (b.status !== 'BOUGHT') return;
    this.tradeService.sellBoughtTrade(b).subscribe({
      next: () => { this.message = 'Sold'; this.loadBought(); },
      error: () => { this.message = 'Sell failed'; }
    });
  }
}
