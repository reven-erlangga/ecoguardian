export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotifListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}
