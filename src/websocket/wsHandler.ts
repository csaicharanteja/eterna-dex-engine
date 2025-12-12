import { WebSocket } from 'ws';
const clients = new Map<string, WebSocket>();

export const registerClient = (orderId: string, ws: WebSocket) => {
    clients.set(orderId, ws);
    console.log(`[WS] Client connected for order ${orderId}`);

    ws.on('close', () => {
        clients.delete(orderId);
    });
};

export const broadcastStatus = (orderId: string, status: string, data?: any) => {
    const ws = clients.get(orderId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ 
            orderId, 
            status, 
            ...data, 
            timestamp: new Date().toISOString() 
        });
        ws.send(payload);
    }
};
