import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { MARK_READ, MARK_ALL_READ } from '../graphql/mutations';

export async function fetchNotifications(page = 1, perPage = 20) {
  const r = await client.query(GET_NOTIFICATIONS, { input: { page, perPage } }).toPromise();
  if (!r.error && r.data?.notification_NotificationService_ListNotifications) {
    return {
      notifs: camelizeKeys(r.data.notification_NotificationService_ListNotifications.notifications),
      total: r.data.notification_NotificationService_ListNotifications.total,
    };
  }
  return { notifs: [], total: 0 };
}

export async function markRead(id: string) {
  const r = await client.mutation(MARK_READ, { input: { id } }).toPromise();
  return !r.error;
}

export async function markAllRead() {
  const r = await client.mutation(MARK_ALL_READ, {}).toPromise();
  return !r.error;
}