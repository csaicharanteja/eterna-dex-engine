import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 30000, 
});
export const saveOrderHistory = async (orderId: string, status: string, details: any) => {
    try {
        // console.log(`[DB] Saved order ${orderId} status: ${status}`);
    } catch (err) {
        console.error('[DB] Save failed:', err);
    }
};
