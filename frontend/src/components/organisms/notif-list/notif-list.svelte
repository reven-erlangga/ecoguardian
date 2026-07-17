<script lang="ts">
  import type { NotifListProps } from './notif-list.types';
  import { useNotifList } from './notif-list.component';
  import NotifItem from '@components/notif-item/NotifItem.svelte';

  let { notifications, onMarkRead }: NotifListProps = $props();
  const { groups } = useNotifList({ notifications, onMarkRead });
</script>

<div class="flex flex-col gap-6">
  {#each groups as group}
    <div>
      <h3 class="text-sm font-bold text-gray-500 uppercase mb-2 neo-border inline-block px-3 py-1 bg-gray-100">
        {group.date}
      </h3>
      <div class="flex flex-col gap-2">
        {#each group.items as notif (notif.id)}
          <NotifItem {notif} onMarkRead={() => onMarkRead(notif.id)} />
        {/each}
      </div>
    </div>
  {/each}

  {#if groups.length === 0}
    <p class="text-center text-gray-400 py-8">Tidak ada notifikasi</p>
  {/if}
</div>
