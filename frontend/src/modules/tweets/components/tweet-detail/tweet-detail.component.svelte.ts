import { tweetStore } from '../../stores/tweet.store.svelte';
import type { Tweet } from '@shared/types/tweet';

export function useTweetDetail(tweetId: string) {
  let tweet = $state<Tweet | null>(null);
  let loading = $state(false);

  async function load() {
    loading = true;
    tweet = await tweetStore.getById(tweetId);
    loading = false;
  }

  $effect(() => { load(); });

  return { tweet, loading };
}
