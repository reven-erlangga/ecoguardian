import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { QUERY_TWEETS, GET_TWEET } from '../graphql/queries';
import { INGEST_TWEET } from '../graphql/mutations';
import { PAGE_SIZE } from '@shared/constants';
import type { Tweet } from '@shared/types/tweet';
import type { StateData } from '@shared/types/state.types';

const PER_PAGE = PAGE_SIZE;

// --- Feed state ---
const feed = $state<StateData<{
  tweets: Tweet[];
  total: number;
  page: number;
}>>({
  meta: { loading: false, message: '' },
  data: { tweets: [], total: 0, page: 1 },
});

// --- Detail state ---
const detail = $state<StateData<{ tweet: Tweet | null }, { tweetId: string }>>({
  meta: { loading: false, message: '' },
  data: { tweet: null },
  params: { tweetId: '' },
});

// --- Ingest state ---
const ingest = $state<StateData<{ result: { id: string; tweetId: string } | null }, { tweetUrl: string }>>({
  meta: { loading: false, message: '' },
  data: { result: null },
  params: { tweetUrl: '' },
});

export const tweetStore = {
  feed,
  detail,
  ingest,

  actions: {
    async fetch(filters?: { keyword?: string; author?: string; classificationLabel?: string }) {
      feed.meta = { loading: true, message: '' };
      try {
        const r = await client.mutation(QUERY_TWEETS, {
          input: {
            ...filters,
            pagination: { page: feed.data.page, per_page: PER_PAGE },
          },
        }).toPromise();
        if (r.error) throw new Error(r.error.message);
        const data = r.data?.twitter_TwitterService_QueryTweets;
        if (data) {
          feed.data.tweets = camelizeKeys(data.tweets ?? []);
          feed.data.total = data.pagination?.total ?? 0;
        }
        feed.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat tweets.';
        feed.meta = { loading: false, message: msg };
        throw e;
      }
    },

    setPage(p: number) {
      feed.data.page = p;
    },

    async loadById(tweetId: string) {
      detail.meta = { loading: true, message: '' };
      detail.params = { tweetId };
      try {
        const r = await client.query(GET_TWEET, { input: { id: tweetId } }).toPromise();
        if (r.error) throw new Error(r.error.message);
        detail.data.tweet = r.data?.twitter_TwitterService_GetTweet
          ? camelizeKeys(r.data.twitter_TwitterService_GetTweet)
          : null;
        detail.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat detail tweet.';
        detail.meta = { loading: false, message: msg };
        detail.data.tweet = null;
      }
    },

    async ingest(tweetUrl: string) {
      ingest.meta = { loading: true, message: '' };
      ingest.params = { tweetUrl };
      try {
        const r = await client.mutation(INGEST_TWEET, { input: { tweetUrl } }).toPromise();
        if (r.error) throw new Error(r.error.message);
        ingest.data.result = r.data?.twitter_TwitterService_IngestTweet ?? null;
        ingest.meta = { loading: false, message: '' };
        return ingest.data.result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal ingest tweet.';
        ingest.meta = { loading: false, message: msg };
        throw e;
      }
    },
  },
};