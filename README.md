# Eterna Order Execution Engine

A high-performance, low-latency order execution engine capable of intelligent DEX routing (Raydium vs Meteora), concurrent processing, and real-time WebSocket updates.

## 🚀 Deliverables Checklist
- [x] **Smart Routing:** Auto-selects best price between Raydium/Meteora.
- [x] **Concurrency:** Handles 10 concurrent orders via BullMQ + Redis.
- [x] **WebSockets:** Real-time order lifecycle streaming.
- [x] **Resilience:** Exponential backoff (3 attempts) for failed swaps.

## 🛠 Tech Stack
- **Node.js / TypeScript**: For type-safe backend logic.
- **Fastify**: High-performance web framework.
- **BullMQ + Redis**: Distributed queue for concurrency management.
- **Jest**: Unit and integration testing.

## 📐 Design Decisions
**1. Why Market Orders?**
I chose Market Orders to prioritize the latency of the "Routing" phase. In high-frequency environments, the speed of selecting the best route (Raydium vs Meteora) is critical. Market orders allow us to focus on immediate execution logic rather than maintaining a complex in-memory order book state.

**2. Handling Concurrency**
I utilized BullMQ (backed by Redis) to decouple HTTP ingestion from execution. This ensures the API remains responsive even during high bursts. The worker is configured with `concurrency: 10` and a rate limiter of `100 orders/minute` to respect downstream DEX RPC limits.

**3. Extending to Limit Orders**
To support Limit Orders, I would introduce a Redis Sorted Set (ZSET). Orders would be scored by price. A separate "Price Watcher" service would subscribe to slot updates and trigger execution only when `market_price <= limit_price`.

## 🏃 How to Run
1. **Start Redis** (Required):
   ```bash
   redis-server
2.Install Dependencies:
  npm install
3. Start the Engine:
npm run dev
4. Run Tests:
npm test
