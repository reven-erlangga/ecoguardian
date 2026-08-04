import { tweetStore } from '../../stores/tweet.stores';

// ─── CSS classes ──────────────────────────────────────
export const containerClass = 'space-y-4';
export const cardClass = 'border-2 border-border rounded-base p-4 bg-card shadow-shadow';
export const headerClass = 'flex items-center gap-2';
export const authorClass = 'font-medium text-sm';
export const usernameClass = 'text-xs text-gray-500';
export const dateClass = 'text-xs text-gray-400';
export const contentClass = 'text-sm mt-2';
export const badgeRowClass = 'flex gap-1 mt-2';
export const badgeClass = 'inline-block px-2 py-0.5 text-xs rounded-base border-2 border-border';
export const loadingClass = 'text-sm text-gray-500 text-center py-8';
export const emptyClass = 'text-sm text-gray-500 text-center py-8';
export const labelBadgeColor = (label: string) => {
  const colors: Record<string, string> = {
    fallen_tree: 'bg-green-100 text-green-800',
    garbage: 'bg-yellow-100 text-yellow-800',
    vandalism: 'bg-red-100 text-red-800',
  };
  return colors[label] ?? 'bg-gray-100 text-gray-800';
};

export const useTweetFeed = () => {
  const store = tweetStore.feed;

  async function loadMore() {
    store.data.page = store.data.page + 1;
    await tweetStore.actions.fetch();
  }

  $effect(() => {
    tweetStore.actions.fetch();
  });

  return { store, loadMore };
};