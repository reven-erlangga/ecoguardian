<script lang="ts">
  import type { TweetCardProps } from './tweet-card.types';
  import { useTweetCard } from './tweet-card.component';
  import Badge from '../badge/Badge.svelte';

  let {
    paraphrased_text,
    author_username,
    label,
    confidence,
    media_urls,
    location,
    created_at,
    ...rest
  }: TweetCardProps = $props();

  const { containerClasses, badgeVariant, confidencePct } = useTweetCard({
    paraphrased_text,
    author_username,
    label,
    confidence,
    media_urls,
    location,
    created_at,
  });
</script>

<div class={containerClasses} {...rest}>
  <div class="flex items-center justify-between">
    <p class="font-bold text-sm">@{author_username}</p>
    <div class="flex items-center gap-2">
      <Badge variant={badgeVariant} label={label} />
      {#if confidencePct !== undefined}
        <span class="text-xs text-gray-500 font-medium">{confidencePct}%</span>
      {/if}
    </div>
  </div>

  <p class="text-base">{paraphrased_text}</p>

  {#if media_urls && media_urls.length > 0}
    <div class="flex gap-2 overflow-x-auto">
      {#each media_urls as url}
        <img
          src={url}
          alt="Tweet media"
          class="w-24 h-24 object-cover neo-border rounded flex-shrink-0"
        />
      {/each}
    </div>
  {/if}

  <div class="flex items-center gap-3 text-xs text-gray-500">
    {#if location}
      <span>📍 {location}</span>
    {/if}
    {#if created_at}
      <span>{created_at}</span>
    {/if}
  </div>
</div>
