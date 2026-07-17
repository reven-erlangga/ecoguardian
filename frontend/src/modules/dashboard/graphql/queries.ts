export const DASHBOARD_STATS_QUERY = `query {
  twitter_TwitterService_connectivityState { connected }
  user_UserService_Me { id email username role }
}`;

export const DASHBOARD_RECENT_TWEETS = `query($page: Int, $perPage: Int) {
  twitter_TwitterService_ListTweets(input: { page: $page, perPage: $perPage }) {
    tweets { id tweet_id text paraphrased_text author author_username created_at classification { text { label confidence } image { label confidence } } }
    total
  }
}`;

export const DASHBOARD_UNREAD_NOTIFS = `query {
  notification_NotificationService_ListNotifications(input: { status: unread, page: 1, perPage: 1 }) {
    total
  }
}`;
