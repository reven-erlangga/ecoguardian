export interface RecentTweet {
  id: string;
  tweetId: string;
  text: string;
  authorUsername: string;
  createdAt: number;
  classificationLabel: string;
}

export interface RecentIssue {
  id: string;
  type: string;
  status: 'open' | 'resolved';
  address: string;
  createdAt: number;
}

export interface DashboardStats {
  totalTweets: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  unreadNotifications: number;
  blockchainBlocks: number;
  blockchainVerified: boolean;
  issuesByType: Record<string, number>;
  recentTweets: RecentTweet[];
  recentIssues: RecentIssue[];
}