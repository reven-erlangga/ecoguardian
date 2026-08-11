import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ingestTweet, findTweetByTweetId } from './ingest.js';
import { getDb } from './mongo.js';

const PROTO_ROOT = process.env.PROTO_ROOT || '/app/proto';
const PROTO_PATH = process.env.PROTO_PATH || '/app/proto';

const packageDefinition = protoLoader.loadSync(`${PROTO_PATH}/twitter/service.proto`, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
  includeDirs: [PROTO_ROOT],
});
const proto = grpc.loadPackageDefinition(packageDefinition);

function toTimestamp(date) {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanos = (date.getMilliseconds() % 1000) * 1e6;
  return { seconds, nanos };
}

// Map TweetDoc (MongoDB) → proto Tweet (termasuk classification & location)
function toTweetProto(doc) {
  const classification = doc.classification
    ? {
        text: {
          label: doc.classification.text?.label || '',
          confidence: doc.classification.text?.confidence || 0,
        },
        image: {
          label: doc.classification.image?.label || '',
          confidence: doc.classification.image?.confidence || 0,
        },
      }
    : null;
  return {
    id: doc._id.toString(),
    tweet_id: doc.tweet_id,
    text: doc.paraphrased_text || doc.text || '',
    author: doc.author || '',
    author_username: doc.author_username || '',
    media_urls: doc.media_urls || [],
    created_at: toTimestamp(doc.created_at),
    metadata: doc.metadata || {},
    paraphrased_text: doc.paraphrased_text || '',
    classification,
    location: doc.location
      ? { lat: doc.location.lat || 0, lon: doc.location.lon || 0, address: doc.location.address || '' }
      : null,
  };
}

export function startGrpc(port) {
  const server = new grpc.Server();

  server.addService(proto.twitter.TwitterService.service, {
    IngestTweet: async (call, callback) => {
      try {
        const req = call.request;
        const { id, validation } = await ingestTweet({
          tweetId: req.tweet_id,
          text: req.text,
          author: req.author,
          authorUsername: req.author_username,
          mediaUrls: req.media_urls || [],
          metadata: req.metadata || {},
          parentTweetId: req.parent_tweet_id || '',
        });
        callback(null, {
          id,
          validation: validation.map((v) => ({ field: v.field, message: v.message, severity: v.severity })),
        });
      } catch (e) {
        callback({ code: grpc.status.INTERNAL, message: String(e.message || e) });
      }
    },

    GetTweet: async (call, callback) => {
      try {
        const doc = await getDb().collection('tweets').findOne({ _id: call.request.id });
        if (!doc) return callback({ code: grpc.status.NOT_FOUND, message: 'tweet not found' });
        callback(null, toTweetProto(doc));
      } catch (e) {
        callback({ code: grpc.status.INTERNAL, message: String(e.message || e) });
      }
    },

    QueryTweets: async (call, callback) => {
      try {
        const req = call.request;
        const page = req.pagination?.page > 0 ? req.pagination.page : 1;
        const perPage = req.pagination?.per_page > 0 ? req.pagination.per_page : 20;
        const filter = {};
        if (req.author) filter.author = req.author;
        if (req.keyword) filter.paraphrased_text = { $regex: req.keyword, $options: 'i' };
        if (req.classification_label) filter['classification.label'] = req.classification_label;

        // Date range filter
        const dateFilter = {};
        if (req.start_date && req.start_date.seconds) dateFilter.$gte = new Date(req.start_date.seconds * 1000);
        if (req.end_date && req.end_date.seconds) dateFilter.$lte = new Date(req.end_date.seconds * 1000);
        if (Object.keys(dateFilter).length > 0) filter.created_at = dateFilter;

        const coll = getDb().collection('tweets');
        const docs = await coll.find(filter).sort({ created_at: -1 }).skip((page - 1) * perPage).limit(perPage).toArray();
        const total = await coll.countDocuments(filter);
        callback(null, {
          tweets: docs.map(toTweetProto),
          pagination: { page, per_page: perPage, total },
        });
      } catch (e) {
        callback({ code: grpc.status.INTERNAL, message: String(e.message || e) });
      }
    },
  });

  return new Promise((resolve, reject) => {
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err) => {
      if (err) return reject(err);
      console.log(`✅ gRPC listening on ${port}`);
      resolve(server);
    });
  });
}
