// RabbitMQ consumer → EventEmitter → GraphQL Subscription
// Dipanggil via additionalResolvers di .meshrc.yaml
import { EventEmitter } from "events";
import amqp from "amqplib";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://guest:guest@rabbitmq:5672";

// ── Simple PubSub ──────────────────────────────────────────

class SimplePubSub {
  _emitter = new EventEmitter();
  constructor() { this._emitter.setMaxListeners(100); }
  publish(trigger, payload) { this._emitter.emit(trigger, payload); }
  asyncIterator(trigger) {
    const emitter = this._emitter;
    let pushQueue = [], resolveQueue = [], done = false;
    const listener = (payload) => {
      if (resolveQueue.length) resolveQueue.shift()({ value: payload, done: false });
      else pushQueue.push(payload);
    };
    emitter.on(trigger, listener);
    return { [Symbol.asyncIterator]() { return this; }, next() { if (done) return Promise.resolve({ value: undefined, done: true }); if (pushQueue.length) return Promise.resolve({ value: pushQueue.shift(), done: false }); return new Promise((r) => resolveQueue.push(r)); }, return() { done = true; emitter.off(trigger, listener); resolveQueue.forEach((r) => r({ value: undefined, done: true })); resolveQueue = []; return Promise.resolve({ value: undefined, done: true }); } };
  }
}

const pubsub = new SimplePubSub();

// ── RabbitMQ ───────────────────────────────────────────────

const RECONNECT_DELAY_MS = 3000;

async function start() {
  let conn;
  try {
    conn = await amqp.connect(RABBITMQ_URI);
  } catch (e) {
    console.error("⚠️  RabbitMQ not available:", e.message);
    // ponytail: retry forever — rabbitmq boleh belum siap / drop koneksi
    setTimeout(start, RECONNECT_DELAY_MS);
    return;
  }

  // Handle connection errors/reconnects — tanpa ini, ECONNRESET mematikan proses
  conn.on("error", (err) => {
    console.error("⚠️  RabbitMQ connection error:", err.message, "— reconnecting…");
    try { conn.close(); } catch (_) {}
  });
  conn.on("close", () => {
    console.log("🔌 RabbitMQ connection closed — reconnecting…");
    setTimeout(start, RECONNECT_DELAY_MS);
  });

  try {
    const ch = await conn.createChannel();
    await ch.assertExchange("ecoguard.events", "topic", { durable: true });
    const q = await ch.assertQueue("", { exclusive: true });
    await ch.bindQueue(q.queue, "ecoguard.events", "tweet.ingested");
    ch.consume(q.queue, (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`📨 Subscription: tweet.ingested → ${payload.tweet_id}`);
        pubsub.publish("ISSUE_CREATED", { issueCreated: { id: payload.id, tweet_id: payload.tweet_id, status: "open" } });
      } catch (e) { /* ignore */ }
      ch.ack(msg);
    });
    console.log("✅ RabbitMQ subscription consumer ready");
  } catch (e) {
    console.error("⚠️  RabbitMQ setup error:", e.message, "— reconnecting…");
    setTimeout(start, RECONNECT_DELAY_MS);
  }
}

start();

// ── Resolvers ──────────────────────────────────────────────

export const resolvers = {
  Subscription: {
    issueCreated: {
      subscribe: () => pubsub.asyncIterator("ISSUE_CREATED"),
    },
  },
};
