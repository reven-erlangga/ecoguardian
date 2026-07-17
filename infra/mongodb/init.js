// MongoDB init script — dijalankan setelah mongo-twitter start
// Inisialisasi collections & indexes untuk ecoguard_twitter

db = db.getSiblingDB("ecoguard_twitter");

db.createCollection("tweets");
db.tweets.createIndex({ "tweet_id": 1 }, { unique: true });
db.tweets.createIndex({ "author": 1 });
db.tweets.createIndex({ "created_at": -1 });
db.tweets.createIndex({ "metadata.classification_label": 1 });

print("MongoDB ecoguard_twitter initialized successfully");
