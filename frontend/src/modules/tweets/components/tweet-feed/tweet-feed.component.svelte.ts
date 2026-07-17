import { tweetStore } from '../../stores/tweet.store.svelte';

export function useTweetFeed() {
  const store = tweetStore;

  function loadMore() {
    store.setPage(store.page + 1);
    store.fetch();
  }

  return { store, loadMore };
}
