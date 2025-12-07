interface RawOrder {
    id: string;
    investorId: string;
    instrumentId: number;
    orderType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';
    timestamp: string;
}