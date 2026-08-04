<script lang="ts">
  // ponytail: FeedItem molecule — item feed/notifikasi/aktivitas general
  import type { FeedItemProps } from './feed-item.types';
  import { useFeedItem } from './feed-item.component';

  let {
    id,
    title,
    content,
    type = 'info',
    status,
    createdAt,
    unread,
    action,
    onmarkread,
    class: className = '',
  }: FeedItemProps = $props();

  const { containerClasses, titleClasses, unreadDot } = useFeedItem(type, unread);
</script>

<div class="{containerClasses} {className}">
  <div class="flex items-start justify-between">
    <div class="flex items-center gap-2">
      {#if unreadDot}
        <span class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
      {/if}
      <p class={titleClasses}>{title}</p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      {#if createdAt}
        <span class="text-xs text-muted-foreground">{createdAt}</span>
      {/if}
      {#if action}
        {@render action()}
      {:else if unread && onmarkread}
        <button onclick={() => onmarkread(id)} class="text-xs text-blue-600 hover:underline font-medium">Mark read</button>
      {/if}
    </div>
  </div>
  <p class="text-sm text-muted-foreground mt-1 ml-4">{content}</p>
</div>