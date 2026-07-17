import { notifStore } from '../../stores/notif.store.svelte';

export function useNotifPanel() {
  const store = notifStore;

  async function handleMarkRead(id: string) {
    await store.markRead(id);
  }

  async function handleMarkAllRead() {
    await store.markAllRead();
  }

  return { store, handleMarkRead, handleMarkAllRead };
}
