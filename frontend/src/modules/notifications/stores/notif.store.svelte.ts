import { client } from '@shared/utils/graphql';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { MARK_READ, MARK_ALL_READ } from '../graphql/mutations';
import type { Notification } from '@shared/types/notification';

let _notifs = $state<Notification[]>([]);
let _total = $state(0);
let _loading = $state(false);

export const notifStore = {
  get notifs() { return _notifs; },
  get total() { return _total; },
  get loading() { return _loading; },
  get unreadCount() { return _notifs.filter((n) => n.status === 'unread').length; },
  async fetch(page = 1, perPage = 20) {
    _loading = true;
    const r = await client.query(GET_NOTIFICATIONS, { input: { page, perPage } }).toPromise();
    if (!r.error && r.data?.notification_NotificationService_ListNotifications) {
      _notifs = r.data.notification_NotificationService_ListNotifications.notifications;
      _total = r.data.notification_NotificationService_ListNotifications.total;
    }
    _loading = false;
  },
  async markRead(id: string) {
    const r = await client.mutation(MARK_READ, { input: { id } }).toPromise();
    if (!r.error) {
      const idx = _notifs.findIndex((n) => n.id === id);
      if (idx !== -1) _notifs[idx] = { ..._notifs[idx], status: 'read' };
    }
  },
  async markAllRead() {
    const r = await client.mutation(MARK_ALL_READ, { input: {} }).toPromise();
    if (!r.error) {
      _notifs = _notifs.map((n) => ({ ...n, status: 'read' }));
    }
  },
};
