import { dashboardStore } from '../../stores/dashboard.store.svelte';

export interface StatCard {
  label: string;
  value: number;
  color: string;
}

export function useStatsGrid() {
  const stats = dashboardStore;
  const cards = $derived.by(() => [
    { label: 'Tweets', value: stats.stats.tweets, color: 'bg-primary' },
    { label: 'Pohon Tumbang', value: stats.stats.fallenTree, color: 'bg-green-500' },
    { label: 'Sampah', value: stats.stats.garbage, color: 'bg-yellow-500' },
    { label: 'Vandalisme', value: stats.stats.vandalism, color: 'bg-destructive' },
    { label: 'Notifikasi', value: stats.stats.unreadNotifs, color: 'bg-accent' },
  ] satisfies StatCard[]);

  return { cards };
}
