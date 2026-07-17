import type { NotifListProps, Notification } from './notif-list.types';

export interface GroupedNotifs {
  date: string;
  items: Notification[];
}

export function useNotifList(p: NotifListProps) {
  function groupByDate(): GroupedNotifs[] {
    const map = new Map<string, Notification[]>();
    for (const n of p.notifications) {
      const date = n.createdAt.slice(0, 10);
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(n);
    }
    return Array.from(map.entries())
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  return {
    groups: groupByDate(),
    onMarkRead: p.onMarkRead,
  };
}
