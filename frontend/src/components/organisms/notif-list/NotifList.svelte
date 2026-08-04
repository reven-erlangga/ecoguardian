<script lang="ts">
  import type { NotifListProps } from './notif-list.types';
  import { useNotifList } from './notif-list.component';
  import FeedItem from '@components/molecules/feed-item/FeedItem.svelte';

  let { notifications, onMarkRead }: NotifListProps = $props();
  const { groups } = useNotifList({ notifications, onMarkRead });
</script>

<div class="flex flex-col gap-6">
  {#each groups as group}
    <div>
      <h3 class="text-sm font-heading text-muted-foreground uppercase mb-2 border-2 border-border rounded-base inline-block px-3 py-1 bg-gray-100">
        {group.date}
      </h3>
      <div class="flex flex-col gap-2">
        {#each group.items as notif (notif.id)}
          <FeedItem
              id={notif.id}
              title={notif.title}
              content={notif.content}
              type={notif.type}
              status={notif.status}
              createdAt={typeof notif.createdAt === 'object' ? String(notif.createdAt.seconds) : String(notif.createdAt)}
              unread={notif.status === 'unread'}
              onmarkread={onMarkRead}
            />
        {/each}
      </div>
    </div>
  {/each}

  {#if groups.length === 0}
    <p class="text-center text-gray-400 py-8">Tidak ada notifikasi</p>
  {/if}
</div>