export interface Notification {
  id: string;
  userId: string;
  type: string;
  channel: string;
  title: string;
  content: string;
  status: 'unread' | 'read';
  createdAt: { seconds: number };
  readAt?: { seconds: number };
}