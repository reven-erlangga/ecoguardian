import type { TweetListProps } from './tweet-list.types';

export function useTweetList(p: TweetListProps) {
  return {
    tweets: p.tweets,
    loading: p.loading ?? false,
    hasMore: !!p.onLoadMore,
    onLoadMore: p.onLoadMore,
  };
}
