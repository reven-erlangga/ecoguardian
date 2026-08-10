import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Baca .env dari root/infra bila ada (untuk dev lokal)
function loadEnv() {
  const candidates = [
    path.resolve(__dirname, '../../infra/.env'),
    path.resolve(__dirname, '../../.env'),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim();
      if (process.env[k] === undefined) process.env[k] = v;
    }
  }
}
loadEnv();

export const config = {
  grpcPort: parseInt(process.env.GRPC_PORT || '50052', 10),
  httpPort: parseInt(process.env.HTTP_PORT || '8000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017',
  rabbitmqUri: process.env.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672',
  handle: process.env.TWITTER_HANDLE || 'mnatori26',
  mentionRule: process.env.TWITTER_MENTION_RULE || '#LaporinAja',
  classificationGrpcAddr: process.env.CLASSIFICATION_GRPC_ADDR || 'localhost:50053',
  nlpGrpcAddr: process.env.NLP_GRPC_ADDR || 'localhost:50055',
  blockchainGrpcAddr: process.env.BLOCKCHAIN_GRPC_ADDR || 'localhost:50056',
  assetGrpcAddr: process.env.ASSET_GRPC_ADDR || 'localhost:50058',
  oauth2: {
    accessToken: process.env.TWITTER_OAUTH2_ACCESS_TOKEN || '',
    refreshToken: process.env.TWITTER_OAUTH2_REFRESH_TOKEN || '',
    clientId: process.env.TWITTER_OAUTH2_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_OAUTH2_CLIENT_SECRET || '',
  },
  bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
};
