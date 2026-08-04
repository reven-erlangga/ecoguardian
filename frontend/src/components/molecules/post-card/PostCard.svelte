<script lang="ts">
  // ponytail: PostCard molecule — post/konten dengan author, text, label, media
  import type { PostCardProps } from './post-card.types';
  import { usePostCard } from './post-card.component';
  import Badge from '@components/atoms/badge/Badge.svelte';
  import Progress from '@components/atoms/progress/Progress.svelte';

  let {
    text,
    author,
    label,
    confidence,
    mediaUrls,
    location,
    createdAt,
    class: className = '',
  }: PostCardProps = $props();

  const { containerClasses, badgeVariant, confidencePct } = usePostCard({
    text,
    author,
    label,
    confidence,
    mediaUrls,
    location,
    createdAt,
  });
</script>

<div class="{containerClasses} {className}">
  <div class="flex items-center justify-between">
    <p class="font-heading text-sm">@{author}</p>
    <div class="flex items-center gap-2">
      <Badge variant={badgeVariant}>{label}</Badge>
      {#if confidencePct !== undefined}
        <Progress value={confidencePct} />
      {/if}
    </div>
  </div>

  <p class="text-base">{text}</p>

  {#if mediaUrls && mediaUrls.length > 0}
    <div class="flex gap-2 overflow-x-auto">
      {#each mediaUrls as url}
        <img src={url} alt="Media" class="w-24 h-24 object-cover border-2 border-border rounded-base flex-shrink-0" />
      {/each}
    </div>
  {/if}

  <div class="flex items-center gap-3 text-xs text-muted-foreground">
    {#if location}
      <span>📍 {location}</span>
    {/if}
    {#if createdAt}
      <span>{createdAt}</span>
    {/if}
  </div>
</div>