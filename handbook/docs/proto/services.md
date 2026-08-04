# Service Definitions

Complete list of services and their RPC methods.

## Classification Service

**Package**: `classification` **| Port**: 50053

```protobuf
service ClassificationService {
  // Single image → label
  rpc ClassifyImage(ClassifyImageRequest) returns (ClassifyImageResponse);

  // Multiple images → majority vote aggregation
  rpc ClassifyImages(ClassifyImagesRequest) returns (ClassifyImagesResponse);
}
```

## Twitter Service

**Package**: `twitter` **| Port**: 50052

```protobuf
service TwitterService {
  // Ingest tweet with validation + auto-reply
  rpc IngestTweet(IngestTweetRequest) returns (IngestTweetResponse);
  // Get single tweet by id
  rpc GetTweet(GetTweetRequest) returns (Tweet);
  // Query tweets with filters
  rpc QueryTweets(QueryTweetsRequest) returns (QueryTweetsResponse);
}
```

## User Service

**Package**: `user` **| Port**: 50051

```protobuf
service UserService {
  rpc Register(RegisterRequest) returns (RegisterResponse);
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc GetUser(GetUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc GetUserCount(Empty) returns (UserCountResponse);
}

service AuthService {
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (TokenResponse);
  rpc Logout(LogoutRequest) returns (Empty);
}
```

## Notification Service

**Package**: `notification` **| Port**: 50054

```protobuf
service NotificationService {
  rpc SendNotification(SendNotificationRequest) returns (SendNotificationResponse);
  rpc GetNotifications(GetNotificationsRequest) returns (GetNotificationsResponse);
  rpc MarkRead(MarkReadRequest) returns (Empty);
}
```

## NLP Service

**Package**: `nlp` **| Port**: 50055

```protobuf
service NLPService {
  rpc AnalyzeText(AnalyzeTextRequest) returns (AnalyzeTextResponse);
  rpc Geocode(GeocodeRequest) returns (GeocodeResponse);
  rpc GenerateReply(GenerateReplyRequest) returns (GenerateReplyResponse);
}
```

## Blockchain Service

**Package**: `blockchain` **| Port**: 50056

```protobuf
service BlockchainService {
  rpc RecordClassification(RecordClassificationRequest) returns (RecordResponse);
  rpc RecordResolution(RecordResolutionRequest) returns (RecordResponse);
  rpc GetHistory(GetHistoryRequest) returns (GetHistoryResponse);
  rpc VerifyChain(Empty) returns (VerifyResponse);
}
```

## Issue Service

**Package**: `issue` **| Port**: 50057

```protobuf
service IssueService {
  rpc ListIssues(ListIssuesRequest) returns (ListIssuesResponse);
  rpc GetIssue(GetIssueRequest) returns (GetIssueResponse);
  rpc ResolveIssue(ResolveIssueRequest) returns (ResolveIssueResponse);
  rpc ListClusters(ListClustersRequest) returns (ListClustersResponse);
  rpc GetWordCloud(GetWordCloudRequest) returns (GetWordCloudResponse);
}
```

## Asset Service

**Package**: `asset` **| Port**: 50058

```protobuf
service AssetService {
  rpc UploadAsset(UploadAssetRequest) returns (UploadAssetResponse);
  rpc GetAsset(GetAssetRequest) returns (GetAssetResponse);
  rpc ListAssets(ListAssetsRequest) returns (ListAssetsResponse);
}
```

## Dashboard Service

**Package**: `dashboard` **| Port**: 50057 (alongside Issue)

```protobuf
service DashboardService {
  rpc GetStats(Empty) returns (DashboardStats);
}
```
