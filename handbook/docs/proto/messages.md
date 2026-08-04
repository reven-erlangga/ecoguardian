# Message Types

List of shared message types used across services.

## Common (`common/common.proto`)

Base types used by all services.

```protobuf
message Timestamp {
  int64 seconds = 1;
  int32 nanos = 2;
}

message Pagination {
  int32 page = 1;
  int32 per_page = 2;
}

message PaginationResponse {
  int32 page = 1;
  int32 per_page = 2;
  int32 total = 3;
}

message Empty {}

message Error {
  string code = 1;
  string message = 2;
}
```

## Classification

```protobuf
message ClassificationResult {
  string label = 1;
  float confidence = 2;
  repeated LabelScore candidates = 3;
}

message LabelScore {
  string label = 1;
  float confidence = 2;
}

message ClassifyImageRequest {
  bytes image_data = 1;
  string image_format = 2;
  string tweet_id = 3;
}

message ClassifyImagesRequest {
  repeated ImageData images = 1;  // 1-N images
  string tweet_id = 2;
}

message ImageData {
  bytes image_data = 1;
  string image_format = 2;
}

message ImageResult {
  int32 index = 1;
  string label = 2;
  float confidence = 3;
}
```

## Twitter

```protobuf
message Tweet {
  string id = 1;
  string tweet_id = 2;
  string text = 3;
  string author = 4;
  string author_username = 5;
  repeated string media_urls = 6;
  Timestamp created_at = 7;
  map<string, string> metadata = 8;
}

message IngestTweetRequest {
  string tweet_id = 1;
  string text = 2;
  string author = 3;
  string author_username = 4;
  repeated string media_urls = 5;
  Timestamp created_at = 6;
  map<string, string> metadata = 7;
  string parent_tweet_id = 8;  // reply chain
}

message IngestTweetResponse {
  string id = 1;
  repeated ValidationMessage validation = 2;  // auto-reply
}

message ValidationMessage {
  string field = 1;      // "media", "location"
  string message = 2;    // natural reply text
  string severity = 3;   // "error", "warning"
}
```

## Issue / Cluster

```protobuf
message Issue {
  string id = 1;
  string tweet_id = 2;
  string type = 3;
  float confidence = 4;
  string status = 5;
  Location location = 6;
  string paraphrased_text = 7;
  Resolution resolution = 8;
  repeated string image_hashes = 9;
  int64 created_at = 10;
  int64 resolved_at = 11;
}

message Location {
  double lat = 1;
  double lon = 2;
  string address = 3;
}

message Cluster {
  string address = 1;
  double lat = 2;
  double lon = 3;
  int32 issue_count = 4;
  repeated string types = 5;
}
```

## Blockchain

```protobuf
message Block {
  int32 index = 1;
  int64 timestamp = 2;
  string previous_hash = 3;
  string hash = 4;
  int32 nonce = 5;
  BlockData data = 6;
}

message BlockData {
  string type = 1;           // "classification" | "resolution"
  string tweet_id = 2;
  string label = 3;
  float confidence = 4;
  string image_hash = 5;
  Location location = 6;
  ResolutionData resolution = 7;
}
```
