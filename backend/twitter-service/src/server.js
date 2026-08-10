import { config } from './config.js';
import { connectMongo } from './mongo.js';
import { startGrpc } from './grpc.js';
import { startHttp } from './http.js';
import { startWatcher } from './watcher.js';
import { connectRabbit } from './rabbitmq.js';
import { loadTokenFromDb } from './twitter.js';

async function main() {
  console.log('🚀 Twitter Service (Node.js) starting...');
  await connectMongo(config.mongoUri);

  // RabbitMQ publisher (best-effort — jangan crash kalau broker down)
  try {
    await connectRabbit();
  } catch (e) {
    console.warn(`⚠️ RabbitMQ not available: ${e.message}`);
  }

  // Muat token dari DB (lebih fresh dari env). Fallback ke env.
  await loadTokenFromDb();

  // JANGAN refresh di startup — biar refresh token (one-time use) tidak habis.
  // Refresh hanya terjadi otomatis saat request dapat 401/403.
  console.log('✅ Twitter posting via OAuth 2.0 (bisa write)');

  await startGrpc(config.grpcPort);
  startHttp(config.httpPort);
  startWatcher();
  console.log('🛜  Service siap');
}

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
