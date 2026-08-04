export const DASHBOARD_STATS_QUERY = `query {
  dashboard_DashboardService_GetStats(input: {}) {
    total_tweets total_issues open_issues resolved_issues
    unread_notifications blockchain_blocks blockchain_verified
    issues_by_type
    recent_tweets { id tweet_id text author_username created_at classification_label }
    recent_issues { id type status address created_at }
  }
}`;