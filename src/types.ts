export interface OrderRequest {
    tokenIn: string;
    tokenOut: string;
    amount: number;
}
export interface Quote {
    dex: 'Raydium' | 'Meteora';
    price: number;
    fee: number;
}
export interface SwapResult {
    status: 'confirmed' | 'failed';
    txHash?: string;
    executedPrice?: number;
    error?: string;
}
export interface OrderJobData extends OrderRequest {
    orderId: string;
    userId?: string;
}
