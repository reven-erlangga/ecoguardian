<script lang="ts">
  import { useRecentTweets } from './recent-tweets.component.svelte';

  const { tweets, loading } = useRecentTweets();
</script>

<div class="space-y-3">
  <h3 class="text-lg font-semibold text-foreground">Tweet Terbaru</h3>
  {#if loading}
    <p class="text-sm text-muted-foreground">Memuat...</p>
  {:else if tweets.length === 0}
    <p class="text-sm text-muted-foreground">Belum ada tweet.</p>
  {:else}
    {#each tweets as tweet}
      <div class="neo-border neo-shadow-sm rounded-lg bg-card p-4">
        <div class="flex items-center justify-between">
          <span class="font-medium text-foreground">{tweet.author_username}</span>
          <span class="text-xs text-muted-foreground">
            {new Date(tweet.created_at.seconds * 1000).toLocaleDateString('id-ID')}
          </span>
        </div>
        <p class="mt-1 text-sm text-foreground">{tweet.paraphrased_text || tweet.text}</p>
      </div>
    {/each}
  {/if}
</div>
