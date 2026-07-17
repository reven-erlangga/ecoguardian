<script lang="ts">
  import type { TweetListProps } from './tweet-list.types';
  import { useTweetList } from './tweet-list.component';
  import TweetCard from '@components/tweet-card/TweetCard.svelte';
  import { cn } from '@shared/utils/cn';

  let { tweets, loading = false, onLoadMore }: TweetListProps = $props();
  const { hasMore } = useTweetList({ tweets, loading, onLoadMore });
</script>

<div class="flex flex-col gap-4">
  {#each tweets as tweet (tweet.id)}
    <TweetCard {tweet} />
  {/each}

  {#if loading}
    <div class="text-center py-4 text-gray-500">Memuat...</div>
  {/if}

  {#if hasMore && !loading}
    <button
      onclick={onLoadMore}
      class={cn(
        'w-full neo-border bg-blue-500 text-white px-4 py-3 font-bold',
        'hover:bg-blue-600 transition-colors'
      )}
    >
      Muat Lebih Banyak
    </button>
  {/if}
</div>
