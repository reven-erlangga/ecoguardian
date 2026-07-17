export interface Notification {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  title: string;
  content: string;
  status: 'unread' | 'read';
  created_at: { seconds: number };
  read_at?: { seconds: number };
}
