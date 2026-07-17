import { client } from '@shared/utils/graphql';
import type { Tweet } from '@shared/types/tweet';

const QUERY = `query($input: twitter_ListTweetsRequest_Input) {
  twitter_TwitterService_ListTweets(input: $input) {
    tweets { id tweet_id text paraphrased_text author author_username media_urls created_at }
    total
  }
}`;

export function useRecentTweets() {
  let tweets = $state<Tweet[]>([]);
  let loading = $state(true);

  async function fetch() {
    loading = true;
    try {
      const r = await client.query(QUERY, { input: { page: 1, perPage: 5 } }).toPromise();
      if (r.data?.twitter_TwitterService_ListTweets) {
        tweets = r.data.twitter_TwitterService_ListTweets.tweets;
      }
    } catch {
      // silently fail
    } finally {
      loading = false;
    }
  }

  fetch();

  return { tweets, loading };
}
