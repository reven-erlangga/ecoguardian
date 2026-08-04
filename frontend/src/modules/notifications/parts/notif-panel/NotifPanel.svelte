<script lang="ts">
  import { useNotifPanel } from './notif-panel.components';
  import Button from '@components/atoms/button/Button.svelte';
  import {
    containerClass, headerClass, cardClass, cardReadClass, rowClass,
    titleClass, unreadDotClass, contentClass, dateClass,
    loadingClass, emptyClass,
  } from './notif-panel.components';

  const { store, unreadCount, handleMarkRead, handleMarkAllRead } = useNotifPanel();
</script>

<div class={containerClass}>
  {#if store.data.notifs.length > 0 && unreadCount > 0}
    <div class={headerClass}>
      <Button variant="secondary" size="sm" onclick={handleMarkAllRead}>Tandai Semua Dibaca</Button>
    </div>
  {/if}

  {#if store.meta.loading}
    <p class={loadingClass}>Memuat...</p>
  {:else if store.data.notifs.length === 0}
    <p class={emptyClass}>Belum ada notifikasi.</p>
  {:else}
    {#each store.data.notifs as notif}
      <div class="{cardClass} {notif.status === 'read' ? cardReadClass : ''}">
        <div class={rowClass}>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class={titleClass}>{notif.title}</span>
              {#if notif.status === 'unread'}
                <span class={unreadDotClass}></span>
              {/if}
            </div>
            <p class={contentClass}>{notif.content}</p>
            <p class={dateClass}>
              {new Date(notif.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          {#if notif.status === 'unread'}
            <Button variant="secondary" size="sm" onclick={() => handleMarkRead(notif.id)}>Baca</Button>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>