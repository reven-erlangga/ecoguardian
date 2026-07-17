import { client } from '@shared/utils/graphql';
import { QUERY_TWEETS, GET_TWEET } from '../graphql/queries';
import { INGEST_TWEET } from '../graphql/mutations';
import type { Tweet } from '@shared/types/tweet';

let _tweets = $state<Tweet[]>([]);
let _total = $state(0);
let _loading = $state(false);
let _page = $state(1);
const PER_PAGE = 20;

export const tweetStore = {
  get tweets() { return _tweets; },
  get total() { return _total; },
  get loading() { return _loading; },
  get page() { return _page; },
  setPage(p: number) { _page = p; },
  async fetch(filters?: { keyword?: string; author?: string; classificationLabel?: string }) {
    _loading = true;
    const r = await client.query(QUERY_TWEETS, {
      input: { ...filters, page: _page, perPage: PER_PAGE },
    }).toPromise();
    if (!r.error && r.data?.twitter_TwitterService_ListTweets) {
      _tweets = r.data.twitter_TwitterService_ListTweets.tweets;
      _total = r.data.twitter_TwitterService_ListTweets.total;
    }
    _loading = false;
  },
  async getById(id: string): Promise<Tweet | null> {
    const r = await client.query(GET_TWEET, { id }).toPromise();
    if (!r.error && r.data?.twitter_TwitterService_GetTweet) {
      return r.data.twitter_TwitterService_GetTweet;
    }
    return null;
  },
  async ingest(tweetUrl: string) {
    const r = await client.mutation(INGEST_TWEET, { input: { tweetUrl } }).toPromise();
    if (r.error) throw new Error(r.error.message);
    return r.data?.twitter_TwitterService_IngestTweet;
  },
};
