import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { MARK_READ } from '../graphql/mutations';

export async function fetchNotifications(userId = '', page = 1, perPage = 20) {
  const r = await client.query(GET_NOTIFICATIONS, { input: { user_id: userId, pagination: { page, per_page: perPage } } }).toPromise();
  if (!r.error && r.data?.notification_NotificationService_GetNotifications) {
    const raw = r.data.notification_NotificationService_GetNotifications;
    return {
      notifs: camelizeKeys(raw.notifications ?? []),
      total: raw.pagination?.total ?? 0,
    };
  }
  return { notifs: [], total: 0 };
}

export async function markRead(id: string, userId = '') {
  const r = await client.mutation(MARK_READ, { input: { id, user_id: userId } }).toPromise();
  return !r.error;
}

export async function markAllRead(userId = '') {
  // Gateway tidak expose MarkAllRead — tandai semua yang unread satu per satu.
  const { notifs } = await fetchNotifications(userId, 1, 100);
  const unread = notifs.filter((n) => n.status !== 'read');
  let ok = true;
  for (const n of unread) {
    const r = await client.mutation(MARK_READ, { input: { id: n.id, user_id: userId } }).toPromise();
    if (r.error) ok = false;
  }
  return ok;
}
