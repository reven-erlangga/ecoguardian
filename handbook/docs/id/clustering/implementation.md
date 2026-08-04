# Implementasi

Clustering via gRPC endpoint `ListClusters` di Issue Service.

## Proto

```protobuf
message Cluster {
  string address = 1;
  double lat = 2;
  double lon = 3;
  int32 issue_count = 4;
  repeated string types = 5;
}

service IssueService {
  rpc ListClusters(ListClustersRequest) returns (ListClustersResponse);
}
```

## Saat Ini: MongoDB Aggregation

```python
def list_clusters(self):
    pipeline = [
        {"$match": {"location.address": {"$ne": ""}}},
        {"$group": {
            "_id": "$location.address",
            "lat": {"$first": "$location.lat"},
            "lon": {"$first": "$location.lon"},
            "issue_count": {"$sum": 1},
            "types": {"$addToSet": "$type"},
        }},
    ]
    return list(self.issues.aggregate(pipeline))
```

## Rencana: DBSCAN

```python
from sklearn.cluster import DBSCAN
coords = np.radians([[i.lat, i.lon] for i in issues])
db = DBSCAN(eps=0.01, min_samples=3, metric="haversine")
labels = db.fit_predict(coords)
```
