export interface MarketOffer {
  id?: number;
  instrument: string;
  availableQuantity: number;
  price: number;
  type: 'SELL' | 'BUY';
  timestamp?: string;
}