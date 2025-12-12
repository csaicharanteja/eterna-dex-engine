import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { MockDexRouter } from '../services/mockDexRouter';
import { broadcastStatus } from '../websocket/wsHandler';
import { saveOrderHistory } from '../db';
import { OrderJobData } from '../types';

const connection = new IORedis({ 
    host: process.env.REDIS_HOST || 'localhost', 
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null 
});

export const orderQueue = new Queue('order-execution', { connection });
const router = new MockDexRouter();

const worker = new Worker('order-execution', async (job: Job<OrderJobData>) => {
    const { orderId, amount, tokenIn, tokenOut } = job.data;
    
    try {
        broadcastStatus(orderId, 'routing', { message: 'Fetching quotes...' });
        // Pass token info to router
        const bestRoute = await router.findBestRoute(tokenIn, tokenOut, amount);
        
        broadcastStatus(orderId, 'building', { 
            message: `Selected ${bestRoute.dex} @ $${bestRoute.price.toFixed(2)}` 
        });
        
        broadcastStatus(orderId, 'submitted', { message: 'Transaction sent to Solana' });
        
        const result = await router.executeSwap(bestRoute.dex, amount);
        
        broadcastStatus(orderId, 'confirmed', { 
            txHash: result.txHash, 
            executedPrice: bestRoute.price 
        });

        await saveOrderHistory(orderId, 'confirmed', { price: bestRoute.price, tx: result.txHash });
        return { ...result, price: bestRoute.price };

    } catch (error: any) {
        console.error(`[Order ${orderId}] Failed: ${error.message}`);
        
        if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
            broadcastStatus(orderId, 'failed', { error: error.message });
            await saveOrderHistory(orderId, 'failed', { error: error.message });
        }
        throw error;
    }
}, { 
    connection, 
    concurrency: 10,
    limiter: {
        max: 100,
        duration: 60000
    }
});
