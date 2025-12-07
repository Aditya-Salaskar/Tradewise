export interface Instrument {
  instrumentId: number;
  tickerSymbol: string;
  companyName: string;
  assetType: 'Stock' | string;
  sector: string;
}

export interface PriceHistory {
  priceId: number;
  instrumentId: number;
  timestamp: string;
  price: number;
  volume: number;
  dailyHigh: number;
  dailyLow: number;
}

export interface FinancialData {
  instruments: Instrument[];
  priceHistories: PriceHistory[];
}