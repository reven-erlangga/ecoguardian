<script lang="ts">
  import { useNotifPanel } from './notif-panel.component.svelte';

  const { store, handleMarkRead, handleMarkAllRead } = useNotifPanel();
</script>

<div class="space-y-4">
  {#if store.notifs.length > 0 && store.unreadCount > 0}
    <div class="flex justify-end">
      <button
        onclick={handleMarkAllRead}
        class="neo-border neo-shadow-sm rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
      >
        Tandai Semua Dibaca
      </button>
    </div>
  {/if}

  {#if store.loading}
    <p class="text-sm text-muted-foreground">Memuat...</p>
  {:else if store.notifs.length === 0}
    <p class="text-sm text-muted-foreground">Belum ada notifikasi.</p>
  {:else}
    {#each store.notifs as notif}
      <div
        class="neo-border neo-shadow-sm rounded-lg bg-card p-4"
        class:bg-muted={notif.status === 'read'}
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-foreground">{notif.title}</span>
              {#if notif.status === 'unread'}
                <span class="h-2 w-2 rounded-full bg-accent"></span>
              {/if}
            </div>
            <p class="mt-1 text-sm text-foreground">{notif.content}</p>
            <p class="mt-1 text-xs text-muted-foreground">
              {new Date(notif.created_at.seconds * 1000).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          {#if notif.status === 'unread'}
            <button
              onclick={() => handleMarkRead(notif.id)}
              class="ml-2 neo-border neo-shadow-sm rounded-md bg-card px-2 py-1 text-xs font-medium hover:opacity-80"
            >
              Baca
            </button>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>
