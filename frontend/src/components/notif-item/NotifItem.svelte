<script lang="ts">
  import type { NotifItemProps } from './notif-item.types';
  import { useNotifItem } from './notif-item.component';

  let {
    id,
    title,
    content,
    type,
    status,
    created_at,
    unread,
    onmarkread,
    ...rest
  }: NotifItemProps = $props();

  const { containerClasses, titleClasses, unreadDot } = useNotifItem({
    id,
    title,
    content,
    type,
    status,
    created_at,
    unread,
    onmarkread,
  });
</script>

<div class={containerClasses} {...rest}>
  <div class="flex items-start justify-between">
    <div class="flex items-center gap-2">
      {#if unreadDot}
        <span class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
      {/if}
      <p class={titleClasses}>{title}</p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-xs text-gray-500">{created_at}</span>
      {#if unread && onmarkread}
        <button
          onclick={() => onmarkread(id)}
          class="text-xs text-blue-600 hover:underline font-medium"
        >
          Mark read
        </button>
      {/if}
    </div>
  </div>
  <p class="text-sm text-gray-600 mt-1 ml-4">{content}</p>
</div>
