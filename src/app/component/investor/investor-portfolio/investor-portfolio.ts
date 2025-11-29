
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investor-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investor-portfolio.html',
  styleUrl: './investor-portfolio.css',
})
export class InvestorPortfolio {
  // placeholder data and logic can be added here later
  
holdings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'Equity', quantity: 100, avgPrice: 2450, currentPrice: 2580, value: 258000, gainLoss: 13000, gainLossPercent: 5.3 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', type: 'Equity', quantity: 50, avgPrice: 3200, currentPrice: 3450, value: 172500, gainLoss: 12500, gainLossPercent: 7.8
    
},
    { symbol: 'INFY', name: 'Infosys Limited', type: 'Equity', quantity: 150, avgPrice: 1420, currentPrice: 1520, value: 228000, gainLoss: 15000, gainLossPercent: 7.0 },
    { symbol: 'HDFC', name: 'HDFC Bank', type: 'Equity', quantity: 80, avgPrice: 2650, currentPrice: 2720, value: 217600, gainLoss: 5600, gainLossPercent: 2.6 },
    { symbol: 'ITC', name: 'ITC Limited', type: 'Equity', quantity: 200, avgPrice: 420, currentPrice: 445, value: 89000, gainLoss: 5000, gainLossPercent: 6.0 },
    { symbol: 'BOND-001', name: 'Govt Bond 7.5% 2030', type: 'Bond', quantity: 10, 
    
avgPrice: 98500, currentPrice: 99200, value: 992000, gainLoss: 7000, gainLossPercent: 0.7 }
  ];

  totalValue = this.holdings.reduce((sum, h) => sum + h.value, 0);
  totalGainLoss = this.holdings.reduce((sum, h) => sum + h.gainLoss, 0);
 
 activeFilter = 'All';

  filterHoldings(type: string) {
    this.activeFilter = type;
  }

  get filteredHoldings() {
    if (this.activeFilter === 'All') return this.holdings;
    return this.holdings.filter(h => h.type === this.activeFilter);
  }

}
