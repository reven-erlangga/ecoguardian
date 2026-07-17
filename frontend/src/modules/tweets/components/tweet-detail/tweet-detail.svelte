<script lang="ts">
  import { useTweetDetail } from './tweet-detail.component.svelte';
  import { LABELS } from '@shared/constants';
  import { formatDateTime } from '@shared/utils/format';

  let { tweetId }: { tweetId: string } = $props();
  const { tweet, loading } = useTweetDetail(tweetId);

  function labelBadgeColor(label: string): string {
    const found = LABELS.find((l) => l.value === label);
    return found?.color ?? 'bg-muted';
  }
</script>

{#if loading}
  <p class="text-sm text-muted-foreground">Memuat detail tweet...</p>
{:else if !tweet}
  <p class="text-sm text-destructive">Tweet tidak ditemukan.</p>
{:else}
  <div class="neo-border neo-shadow-sm rounded-lg bg-card p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <span class="font-semibold text-foreground">{tweet.author_username}</span>
        <span class="ml-2 text-sm text-muted-foreground">@{tweet.author}</span>
      </div>
      <span class="text-xs text-muted-foreground">
        {formatDateTime(tweet.created_at.seconds)}
      </span>
    </div>

    <p class="text-sm text-foreground">{tweet.paraphrased_text || tweet.text}</p>

    {#if tweet.media_urls && tweet.media_urls.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each tweet.media_urls as url}
          <img src={url} alt="Media tweet" class="max-h-48 rounded-md object-cover neo-border" />
        {/each}
      </div>
    {/if}

    {#if tweet.classification}
      <div class="border-t border-border pt-3">
        <h4 class="text-sm font-semibold text-foreground mb-2">Klasifikasi</h4>
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full {labelBadgeColor(tweet.classification.text.label)} px-3 py-1 text-xs font-medium text-white">
            Teks: {tweet.classification.text.label} ({(tweet.classification.text.confidence * 100).toFixed(0)}%)
          </span>
          {#if tweet.classification.image.label}
            <span class="rounded-full {labelBadgeColor(tweet.classification.image.label)} px-3 py-1 text-xs font-medium text-white">
              Gambar: {tweet.classification.image.label}
            </span>
          {/if}
        </div>
      </div>
    {/if}

    {#if tweet.location}
      <div class="border-t border-border pt-3">
        <h4 class="text-sm font-semibold text-foreground mb-1">Lokasi</h4>
        <p class="text-xs text-muted-foreground">{tweet.location.address}</p>
        <p class="text-xs text-muted-foreground">{tweet.location.lat}, {tweet.location.lon}</p>
      </div>
    {/if}

    <div class="border-t border-border pt-2">
      <a
        href="https://twitter.com/{tweet.author_username}/status/{tweet.tweet_id}"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-primary hover:underline"
      >
        Lihat di Twitter →
      </a>
    </div>
  </div>
{/if}
