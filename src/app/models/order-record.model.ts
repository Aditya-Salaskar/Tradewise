export interface Order {
    id?: string;
    investorId: string;
    instrumentId: number; // Use the actual instrument ID, not the symbol
    orderType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: 'PENDING' | 'EXECUTED' | 'REJECTED';
    timestamp: string;
}