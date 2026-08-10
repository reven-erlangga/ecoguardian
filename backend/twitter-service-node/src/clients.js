import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { config } from './config.js';

// Downstream gRPC clients: Classification, NLP, Blockchain, Asset.
// Mirrors the Rust twitter-service clients (grpc_client.rs, nlp_client.rs,
// blockchain_client.rs, asset_client.rs).

const PROTO_ROOT = process.env.PROTO_ROOT || '/app/proto';
const PROTO_PATH = process.env.PROTO_PATH || '/app/proto';

function load(packageFile, serviceName, endpoint) {
  const packageDefinition = protoLoader.loadSync(`${PROTO_PATH}/${packageFile}`, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
    includeDirs: [PROTO_ROOT],
  });
  const proto = grpc.loadPackageDefinition(packageDefinition);
  // Walk nested packages: classification.ClassificationService etc.
  const parts = serviceName.split('.');
  let svc = proto;
  for (const p of parts.slice(0, -1)) svc = svc[p];
  const Client = svc[parts[parts.length - 1]];
  // grpc-js expects `host:port` (no scheme); strip `http://` from env addr.
  const addr = endpoint.replace(/^https?:\/\//, '');
  return new Client(addr, grpc.credentials.createInsecure());
}

function call(client, method, request, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + timeoutMs / 1000);
    client[method](request, { deadline }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

// ─── Classification (image classification) ─────────────────

export function createClassificationClient() {
  const client = load('classification/service.proto', 'classification.ClassificationService', config.classificationGrpcAddr);
  return {
    async classifyImages(images, tweetId = '') {
      // images: [{ image_data: Buffer, image_format: String }]
      const res = await call(client, 'ClassifyImages', { images, tweet_id: tweetId });
      return res.result;
    },
  };
}

// ─── NLP (analyze, geocode, generate reply) ───────────────

export function createNlpClient() {
  const client = load('nlp/service.proto', 'nlp.NLPService', config.nlpGrpcAddr);
  return {
    async analyzeText(text) {
      const res = await call(client, 'AnalyzeText', { text });
      return {
        label: res.label || '',
        confidence: res.confidence || 0,
        extractedAddress: res.extracted_address || '',
        paraphrasedText: res.paraphrased_text || '',
      };
    },
    async geocode(address) {
      const res = await call(client, 'Geocode', { address });
      return { lat: res.lat, lon: res.lon, displayName: res.display_name || '' };
    },
    async generateReply(tweetText, missingFields, classificationLabel, classificationConfidence) {
      const res = await call(client, 'GenerateReply', {
        tweet_text: tweetText,
        missing_fields: missingFields,
        classification_label: classificationLabel,
        classification_confidence: classificationConfidence,
      });
      return res.message || '';
    },
  };
}

// ─── Blockchain (record classification) ───────────────────

export function createBlockchainClient() {
  const client = load('blockchain/service.proto', 'blockchain.BlockchainService', config.blockchainGrpcAddr);
  return {
    async recordClassification({ tweetId, label, confidence, imageUrl, lat, lon, address }) {
      return call(client, 'RecordClassification', {
        tweet_id: tweetId,
        label,
        confidence,
        image_hash: imageUrl,
        location: { lat, lon, address },
      });
    },
  };
}

// ─── Asset (upload image) ─────────────────────────────────

export function createAssetClient() {
  const client = load('asset/service.proto', 'asset.AssetService', config.assetGrpcAddr);
  return {
    async upload(data, filename, mimeType) {
      const res = await call(client, 'UploadAsset', {
        filename, data, mime_type: mimeType, metadata: '',
      });
      return res.asset?.url || '';
    },
  };
}
