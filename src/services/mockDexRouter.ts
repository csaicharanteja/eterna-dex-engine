import { setTimeout } from 'timers/promises';
import { Quote, SwapResult } from '../types';

export class MockDexRouter {
    private basePrice = 145.50; // Mock SOL price

    async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        await setTimeout(200); // Simulate network delay
        const price = this.basePrice * (0.98 + Math.random() * 0.04); 
        return { dex: 'Raydium', price, fee: 0.003 };
    }

    async getMeteoraQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        await setTimeout(200); 
        const price = this.basePrice * (0.97 + Math.random() * 0.05);
        return { dex: 'Meteora', price, fee: 0.002 };
    }

    async findBestRoute(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        const [raydium, meteora] = await Promise.all([
            this.getRaydiumQuote(tokenIn, tokenOut, amount),
            this.getMeteoraQuote(tokenIn, tokenOut, amount)
        ]);

        // Buy Logic: Lower price is better
        return raydium.price < meteora.price ? raydium : meteora;
    }

    async executeSwap(dex: string, amount: number): Promise<SwapResult> {
        await setTimeout(2000 + Math.random() * 1000);
        
        // Random 5% failure to test retry logic
        if (Math.random() < 0.05) {
            throw new Error('Slippage tolerance exceeded');
        }

        return { 
            status: 'confirmed', 
            txHash: 'sol_' + Math.random().toString(36).substring(2, 15) 
        };
    }
}
