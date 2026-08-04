import { tweetStore } from '../../stores/tweet.stores';

// ─── CSS classes ──────────────────────────────────────
export const cardClass = 'space-y-3';
export const headerClass = 'flex items-center gap-3';
export const authorClass = 'font-medium text-sm';
export const usernameClass = 'text-xs text-gray-500';
export const dateClass = 'text-xs text-gray-400';
export const contentClass = 'text-sm leading-relaxed';
export const mediaClass = 'grid grid-cols-2 gap-2';
export const mediaImgClass = 'rounded-base border-2 border-border w-full object-cover';
export const sectionClass = 'space-y-1';
export const sectionTitleClass = 'text-xs font-semibold uppercase text-gray-500';
export const badgeClass = 'inline-block px-2 py-0.5 text-xs rounded-base border-2 border-border';
export const locationClass = 'text-xs text-gray-500';
export const linkClass = 'text-xs text-blue-600 underline';
export const loadingClass = 'text-sm text-gray-500';
export const errorClass = 'text-sm text-red-600';
export const labelBadgeColor = (label: string) => {
  const colors: Record<string, string> = {
    fallen_tree: 'bg-green-100 text-green-800',
    garbage: 'bg-yellow-100 text-yellow-800',
    vandalism: 'bg-red-100 text-red-800',
  };
  return colors[label] ?? 'bg-gray-100 text-gray-800';
};

export const useTweetDetail = (tweetId: string) => {
  const tweet = $derived(tweetStore.detail.data.tweet);
  const loading = $derived(tweetStore.detail.meta.loading);

  $effect(() => {
    tweetStore.actions.loadById(tweetId);
  });

  return { tweet, loading };
};