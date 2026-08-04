import type { Notification } from '@shared/types/notification';

export interface NotifListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}