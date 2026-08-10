// ponytail: action handlers + CSS classes untuk NotifPanel

import { notifStore } from '../../stores/notif.stores';
import { authStore } from '$modules/auth/stores/auth.stores';

export const containerClass = 'space-y-2';
export const headerClass = 'flex justify-end';
export const cardClass = 'border-2 border-border rounded-base p-4 bg-card shadow-shadow';
export const cardReadClass = 'opacity-60';
export const rowClass = 'flex items-start gap-3';
export const titleClass = 'font-medium text-sm';
export const unreadDotClass = 'w-2 h-2 rounded-full bg-blue-500 inline-block';
export const contentClass = 'text-xs text-gray-600 mt-1';
export const dateClass = 'text-xs text-gray-400 mt-1';
export const loadingClass = 'text-sm text-gray-500';
export const emptyClass = 'text-sm text-gray-500';

export const useNotifPanel = () => {
  const store = notifStore.state;

  const unreadCount = $derived(store.data.notifs.filter((n) => n.status === 'unread').length);

  // user_id untuk filter notifikasi per user login
  const userId = $derived(authStore.session.data.user?.id ?? '');

  async function handleFetch() {
    await notifStore.actions.fetch(userId);
  }

  async function handleMarkRead(id: string) {
    await notifStore.actions.markRead(id, userId);
  }

  async function handleMarkAllRead() {
    await notifStore.actions.markAllRead(userId);
  }

  return { store, unreadCount, handleFetch, handleMarkRead, handleMarkAllRead };
};
