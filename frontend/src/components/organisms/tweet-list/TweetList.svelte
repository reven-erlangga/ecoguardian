<script lang="ts">
  import type { TweetListProps } from './tweet-list.types';
  import { useTweetList } from './tweet-list.component';
  import PostCard from '@components/molecules/post-card/PostCard.svelte';
  import { cn } from '@shared/utils/cn';

  let { tweets, loading = false, onLoadMore }: TweetListProps = $props();
  const { hasMore } = useTweetList({ tweets, loading, onLoadMore });

  // ponytail: flatten classification.text untuk PostCard yang expect flat label/confidence
  function flatten(tweet: TweetListProps['tweets'][number]) {
    const cls = (tweet.classification as any)?.text;
    return {
      label: cls?.label ?? '',
      confidence: cls?.confidence,
    };
  }
</script>

<div class="flex flex-col gap-4">
  {#each tweets as tweet (tweet.id)}
    <PostCard
      text={tweet.paraphrasedText || tweet.text || ''}
      author={tweet.authorUsername || tweet.author || ''}
      label={flatten(tweet).label}
      confidence={flatten(tweet).confidence}
      mediaUrls={tweet.mediaUrls}
      location={tweet.location?.address}
      createdAt={typeof tweet.createdAt === 'object' ? String(tweet.createdAt.seconds) : String(tweet.createdAt)}
    />
  {/each}

  {#if loading}
    <div class="text-center py-4 text-muted-foreground">Memuat...</div>
  {/if}

  {#if hasMore && !loading}
    <button
      onclick={onLoadMore}
      class={cn(
        'w-full border-2 border-border rounded-base bg-main text-main-foreground px-4 py-3 font-heading',
        'hover:bg-blue-600 transition-colors'
      )}
    >
      Muat Lebih Banyak
    </button>
  {/if}
</div>