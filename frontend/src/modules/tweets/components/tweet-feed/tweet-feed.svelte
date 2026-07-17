<script lang="ts">
  import { useTweetFeed } from './tweet-feed.component.svelte';
  import { LABELS } from '@shared/constants';

  const { store, loadMore } = useTweetFeed();

  function labelBadgeColor(label: string): string {
    const found = LABELS.find((l) => l.value === label);
    return found?.color ?? 'bg-muted';
  }
</script>

<div class="space-y-4">
  {#if store.loading}
    <p class="text-sm text-muted-foreground">Memuat...</p>
  {:else if store.tweets.length === 0}
    <p class="text-sm text-muted-foreground">Belum ada tweet.</p>
  {:else}
    {#each store.tweets as tweet}
      <div class="neo-border neo-shadow-sm rounded-lg bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="font-medium text-foreground">{tweet.author_username}</span>
            <span class="ml-2 text-xs text-muted-foreground">@{tweet.author}</span>
          </div>
          <span class="text-xs text-muted-foreground">
            {new Date(tweet.created_at.seconds * 1000).toLocaleDateString('id-ID')}
          </span>
        </div>
        <p class="mt-2 text-sm text-foreground">{tweet.paraphrased_text || tweet.text}</p>
        {#if tweet.classification}
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="rounded-full {labelBadgeColor(tweet.classification.text.label)} px-2 py-0.5 text-xs font-medium text-white">
              {tweet.classification.text.label} ({(tweet.classification.text.confidence * 100).toFixed(0)}%)
            </span>
            {#if tweet.classification.image.label}
              <span class="rounded-full {labelBadgeColor(tweet.classification.image.label)} px-2 py-0.5 text-xs font-medium text-white">
                Gambar: {tweet.classification.image.label}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
    {#if store.total > store.tweets.length}
      <button
        onclick={loadMore}
        class="neo-border neo-shadow-sm w-full rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:opacity-90"
      >
        Muat Lainnya ({store.total - store.tweets.length} tersisa)
      </button>
    {/if}
  {/if}
</div>
