export interface NotifItemProps {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
  unread?: boolean;
  onmarkread?: (id: string) => void;
}
