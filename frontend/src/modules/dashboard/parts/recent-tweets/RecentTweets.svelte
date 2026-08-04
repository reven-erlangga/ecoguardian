<script lang="ts">
  import { dashboardStore } from '../../stores/dashboard.stores';
  import {
    containerClass, titleClass, emptyClass, cardClass, headerClass,
    authorClass, dateClass, contentClass,
    skeletonCardClass, skeletonTitleClass, skeletonLineClass,
    labelClass,
  } from './recent-tweets.components';

  const recent = $derived(dashboardStore.state.data.stats.recentTweets);
  const loading = $derived(dashboardStore.state.meta.loading);
</script>

<div class={containerClass}>
  <h3 class={titleClass}>Tweet Terbaru</h3>
  {#if loading && recent.length === 0}
    <div class="space-y-3">
      {#each Array(3) as _}
        <div class={skeletonCardClass}>
          <div class={skeletonTitleClass}></div>
          <div class={skeletonLineClass}></div>
        </div>
      {/each}
    </div>
  {:else if recent.length === 0}
    <p class={emptyClass}>Belum ada tweet.</p>
  {:else}
    {#each recent as tweet}
      <div class={cardClass}>
        <div class={headerClass}>
          <span class={authorClass}>{tweet.authorUsername || 'unknown'}</span>
          <span class={dateClass}>
            {new Date(tweet.createdAt * 1000).toLocaleDateString('id-ID')}
          </span>
        </div>
        <p class={contentClass}>{tweet.text}</p>
        {#if tweet.classificationLabel}
          <span class="{labelClass} bg-secondary-background border border-border">{tweet.classificationLabel}</span>
        {/if}
      </div>
    {/each}
  {/if}
</div>