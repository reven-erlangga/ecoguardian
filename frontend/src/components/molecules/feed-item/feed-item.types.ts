import type { Snippet } from 'svelte';

export type FeedItemType = 'info' | 'warning' | 'alert' | 'success' | 'error';

export interface FeedItemProps {
  id: string;
  title: string;
  content: string;
  type?: FeedItemType;
  status?: string;
  createdAt?: string;
  unread?: boolean;
  /** Tombol aksi di pojok kanan */
  action?: Snippet;
  /** Callback saat mark read diklik */
  onmarkread?: (id: string) => void;
  class?: string;
}