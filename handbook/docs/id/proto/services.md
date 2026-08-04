# Service Definitions

Daftar service dan RPC.

| Service | Port | RPC Methods |
|---------|------|-------------|
| ClassificationService | 50053 | ClassifyImage, ClassifyImages |
| TwitterService | 50052 | IngestTweet, GetTweet, QueryTweets |
| UserService | 50051 | Register, Login, GetUser, UpdateUser, GetUserCount |
| AuthService | 50051 | ValidateToken, RefreshToken, Logout |
| NotificationService | 50054 | SendNotification, GetNotifications, MarkRead |
| NLPService | 50055 | AnalyzeText, Geocode, GenerateReply |
| BlockchainService | 50056 | RecordClassification, RecordResolution, GetHistory, VerifyChain |
| IssueService | 50057 | ListIssues, GetIssue, ResolveIssue, ListClusters, GetWordCloud |
| AssetService | 50058 | UploadAsset, GetAsset, ListAssets |
| DashboardService | 50057 | GetStats |
