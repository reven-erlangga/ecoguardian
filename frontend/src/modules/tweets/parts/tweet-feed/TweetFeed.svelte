<script lang="ts">
  import { useTweetFeed } from './tweet-feed.components';
  import { LABELS } from '@shared/constants';
  import Button from '@components/atoms/button/Button.svelte';
  import Progress from '@components/atoms/progress/Progress.svelte';
  import {
    containerClass, cardClass, headerClass, authorClass, usernameClass,
    dateClass, contentClass, badgeRowClass, badgeClass,
    loadingClass, emptyClass, labelBadgeColor,
  } from './tweet-feed.components';

  const { store, loadMore } = useTweetFeed();
</script>

<div class={containerClass}>
  {#if store.meta.loading}
    <p class={loadingClass}>Memuat...</p>
  {:else if store.data.tweets.length === 0}
    <p class={emptyClass}>Belum ada tweet.</p>
  {:else}
    {#each store.data.tweets as tweet}
      <div class={cardClass}>
        <div class={headerClass}>
          <div>
            <span class={authorClass}>{tweet.authorUsername}</span>
                        <span class={usernameClass}>@{tweet.author}</span>
                      </div>
                      <span class={dateClass}>
                        {new Date(tweet.createdAt.seconds * 1000).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p class={contentClass}>{tweet.paraphrasedText || tweet.text}</p>
        {#if tweet.classification}
          <div class={badgeRowClass}>
            <span class="{badgeClass} {labelBadgeColor(tweet.classification.text.label, LABELS)}">
              {tweet.classification.text.label} <Progress value={Math.round(tweet.classification.text.confidence * 100)} />
            </span>
            {#if tweet.classification.image.label}
              <span class="{badgeClass} {labelBadgeColor(tweet.classification.image.label, LABELS)}">
                Gambar: {tweet.classification.image.label}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
    {#if store.data.total > store.data.tweets.length}
      <Button variant="secondary" class="w-full" onclick={loadMore}>Muat Lainnya ({store.data.total - store.data.tweets.length} tersisa)</Button>
    {/if}
  {/if}
</div>