import { MongoClient } from 'mongodb';

let client = null;

export async function connectMongo(uri) {
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db('ecoguard_twitter');
  // Ensure indexes
  await db.collection('issues').createIndex({ tweet_id: 1 });
  await db.collection('issues').createIndex({ status: 1 });
  await db.collection('issues').createIndex({ created_at: -1 });
  await db.collection('tweets').createIndex({ tweet_id: 1 });
  await db.collection('tweets').createIndex({ status: 1 });
  await db.collection('tweets').createIndex({ created_at: -1 });
  console.log('✅ MongoDB connected');
  return db;
}

export function getDb() {
  return client.db('ecoguard_twitter');
}
