from pymongo import MongoClient, ASCENDING, DESCENDING


class IssueRepository:
    def __init__(self, mongo_uri: str):
        self.client = MongoClient(mongo_uri)
        self.db = self.client["ecoguard_twitter"]
        self.issues = self.db["issues"]

    def list_issues(self, status="", type_filter="", page=1, per_page=20):
        query = {}
        if status:
            query["status"] = status
        if type_filter:
            query["type"] = type_filter
        total = self.issues.count_documents(query)
        items = list(
            self.issues.find(query)
            .sort("created_at", DESCENDING)
            .skip((page - 1) * per_page)
            .limit(per_page)
        )
        return items, total

    def get_issue(self, issue_id: str) -> dict | None:
        # Rust serde renames id -> _id; query by _id
        return self.issues.find_one({"_id": issue_id})

    def list_clusters(self):
        pipeline = [
            {"$match": {"location.address": {"$ne": None, "$ne": ""}}},
            {
                "$group": {
                    "_id": "$location.address",
                    "lat": {"$first": "$location.lat"},
                    "lon": {"$first": "$location.lon"},
                    "issue_count": {"$sum": 1},
                    "types": {"$addToSet": "$type"},
                }
            },
            {"$sort": {"issue_count": -1}},
        ]
        return list(self.issues.aggregate(pipeline))

    def get_word_cloud(self) -> list[dict]:
        """Aggregate issue types + locations as word count items."""
        pipeline = [
            # Type count
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$project": {"word": "$_id", "count": 1, "_id": 0}},
        ]
        type_counts = list(self.issues.aggregate(pipeline))

        # Address count
        pipeline2 = [
            {"$match": {"location.address": {"$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$location.address", "count": {"$sum": 1}}},
            {"$project": {"word": "$_id", "count": 1, "_id": 0}},
        ]
        addr_counts = list(self.issues.aggregate(pipeline2))

        # Paraphrased text word frequency
        pipeline3 = [
            {"$match": {"paraphrased_text": {"$ne": ""}}},
        ]
        texts = [doc["paraphrased_text"] for doc in self.issues.aggregate(pipeline3)]

        word_freq: dict[str, int] = {}
        for t in texts:
            for w in t.lower().split():
                w = w.strip(".,!?")
                if len(w) > 3:
                    word_freq[w] = word_freq.get(w, 0) + 1

        # Merge: type + address (static weights) + word frequency
        result: list[dict] = []
        for item in type_counts:
            result.append({"word": item["word"], "count": item["count"] * 10})
        for item in addr_counts:
            result.append({"word": item["word"], "count": item["count"] * 5})
        for word, count in word_freq.items():
            result.append({"word": word, "count": count})

        # Sort by count desc, take top 30
        result.sort(key=lambda x: x["count"], reverse=True)
        return result[:30]
