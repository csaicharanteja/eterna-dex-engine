import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { orderQueue } from './queue/orderQueue';
import { registerClient } from './websocket/wsHandler';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const server = Fastify();
server.register(websocket);

server.post('/api/orders/execute', async (request, reply) => {
    const { amount, tokenIn, tokenOut } = request.body as any;

    if (!amount || !tokenIn || !tokenOut) {
        return reply.status(400).send({ error: 'Missing required fields' });
    }

    const orderId = uuidv4();

    await orderQueue.add('execute-swap', { 
        orderId, 
        amount, 
        tokenIn, 
        tokenOut 
    }, {
        attempts: 3, 
        backoff: { type: 'exponential', delay: 1000 }
    });

    return reply.send({ 
        orderId, 
        status: 'pending', 
        wsUrl: `ws://localhost:${process.env.PORT || 3000}/ws/orders/${orderId}` 
    });
});

server.get('/ws/orders/:orderId', { websocket: true }, (connection, req) => {
    const { orderId } = req.params as any;
    registerClient(orderId, connection.socket);
    
    connection.socket.send(JSON.stringify({ 
        status: 'connected', 
        message: `Listening for updates on ${orderId}` 
    }));
});

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
