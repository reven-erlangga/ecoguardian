import amqplib from 'amqplib';
import { config } from './config.js';

// RabbitMQ publisher — mirrors the Rust rabbitmq/publisher.rs.
// Declares the `ecoguard.events` topic exchange and publishes to `tweet.ingested`.

const EXCHANGE = 'ecoguard.events';
const ROUTING_KEY = 'tweet.ingested';

let channel = null;

export async function connectRabbit() {
  const conn = await amqplib.connect(config.rabbitmqUri);
  channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  console.log('✅ Connected to RabbitMQ, exchange ecoguard.events ready');
  return channel;
}

export async function publishTweetIngested(payload) {
  if (!channel) return;
  const body = Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload));
  channel.publish(EXCHANGE, ROUTING_KEY, body);
}
