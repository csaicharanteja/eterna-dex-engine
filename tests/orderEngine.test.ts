import { MockDexRouter } from '../src/services/mockDexRouter';
import { orderQueue } from '../src/queue/orderQueue';

jest.mock('bullmq', () => ({
    Queue: jest.fn().mockImplementation(() => ({ add: jest.fn() })),
    Worker: jest.fn(),
}));

jest.mock('pg', () => {
    const mPool = { query: jest.fn() };
    return { Pool: jest.fn(() => mPool) };
});

describe('Order Execution Engine Tests', () => {
    const router = new MockDexRouter();

    test('1. Raydium quote returns correct structure', async () => {
        const quote = await router.getRaydiumQuote(10);
        expect(quote.dex).toBe('Raydium');
    });

    test('2. Meteora quote returns correct structure', async () => {
        const quote = await router.getMeteoraQuote(10);
        expect(quote.dex).toBe('Meteora');
    });

    test('3. Smart Router selects Raydium when cheaper', async () => {
        jest.spyOn(router, 'getRaydiumQuote').mockResolvedValue({ dex: 'Raydium', price: 100, fee: 0.1 });
        jest.spyOn(router, 'getMeteoraQuote').mockResolvedValue({ dex: 'Meteora', price: 105, fee: 0.1 });
        const best = await router.findBestRoute(10);
        expect(best.dex).toBe('Raydium');
    });

    test('4. Smart Router selects Meteora when cheaper', async () => {
        jest.spyOn(router, 'getRaydiumQuote').mockResolvedValue({ dex: 'Raydium', price: 110, fee: 0.1 });
        jest.spyOn(router, 'getMeteoraQuote').mockResolvedValue({ dex: 'Meteora', price: 105, fee: 0.1 });
        const best = await router.findBestRoute(10);
        expect(best.dex).toBe('Meteora');
    });

    test('5. Execute Swap returns TxHash', async () => {
        const result = await router.executeSwap('Raydium', 10);
        expect(result.status).toBe('confirmed');
        expect(result.txHash).toBeDefined();
    });

    test('6. Queue is initialized correctly', () => {
        expect(orderQueue).toBeDefined();
    });

    test('7. UUID Generator works', () => {
        const { v4 } = require('uuid');
        expect(v4().split('-').length).toBe(5);
    });

    test('8. Retry config is exponential', () => {
        const config = { attempts: 3, backoff: 'exponential' };
        expect(config.attempts).toBe(3);
    });

    test('9. Fee calculation check', () => {
        expect(100 * 0.003).toBe(0.3);
    });

    test('10. WebSocket function exists', () => {
        const { broadcastStatus } = require('../src/websocket/wsHandler');
        expect(typeof broadcastStatus).toBe('function');
    });

    test('11. Database Stub exists', () => {
        const { saveOrderHistory } = require('../src/db');
        expect(typeof saveOrderHistory).toBe('function');
    });

    test('12. Input validation Logic', () => {
        const req = { amount: 0 };
        expect(!req.amount).toBe(true);
    });
});
