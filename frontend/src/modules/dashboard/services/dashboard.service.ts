import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { DASHBOARD_STATS_QUERY } from '../graphql/queries';
import type { DashboardStats, RecentTweet, RecentIssue } from '../types';

interface RawStats {
  total_tweets: number;
  total_issues: number;
  open_issues: number;
  resolved_issues: number;
  unread_notifications: number;
  blockchain_blocks: number;
  blockchain_verified: boolean;
  issues_by_type: Record<string, number>;
  recent_tweets: Array<{
    id: string;
    tweet_id: string;
    text: string;
    author_username: string;
    created_at: number;
    classification_label: string;
  }>;
  recent_issues: Array<{
    id: string;
    type: string;
    status: string;
    address: string;
    created_at: number;
  }>;
}

const EMPTY: DashboardStats = {
  totalTweets: 0,
  totalIssues: 0,
  openIssues: 0,
  resolvedIssues: 0,
  unreadNotifications: 0,
  blockchainBlocks: 0,
  blockchainVerified: false,
  issuesByType: {},
  recentTweets: [],
  recentIssues: [],
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const r = await client.query(DASHBOARD_STATS_QUERY, {}, { requestPolicy: 'network-only' }).toPromise();
  if (r.error) throw r.error;
  const raw = r.data?.dashboard_DashboardService_GetStats as RawStats | undefined;
  if (!raw) return EMPTY;
  // ponytail: convert snake_case GraphQL response → camelCase typed object
  return camelizeKeys(raw);
}