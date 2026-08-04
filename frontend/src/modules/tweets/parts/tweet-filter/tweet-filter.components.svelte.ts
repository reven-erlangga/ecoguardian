// ponytail: pure function helper untuk TweetFilter

import { tweetStore } from '../../stores/tweet.stores';

// ─── CSS classes ──────────────────────────────────────
export const containerClass = 'space-y-3 border-2 border-border rounded-base p-4 bg-card shadow-shadow';
export const rowClass = 'flex gap-3 items-end';
export const fieldClass = 'flex-1';
export const fieldLabelClass = 'block text-xs font-medium mb-1';
export const inputClass = 'w-full border-2 border-border rounded-base px-2 py-1 text-sm';
export const selectClass = 'w-full border-2 border-border rounded-base px-2 py-1 text-sm';
export const buttonGroupClass = 'flex gap-2 items-end';
export const applyButtonClass = 'border-2 border-border rounded-base bg-yellow-300 px-3 py-1 text-sm font-medium';
export const resetButtonClass = 'border-2 border-border rounded-base bg-white px-3 py-1 text-sm';

export async function applyTweetFilter(filters: {
  keyword: string;
  classificationLabel: string;
  author: string;
}) {
  tweetStore.feed.data.page = 1;
  await tweetStore.actions.fetch({
    keyword: filters.keyword || undefined,
    classificationLabel: filters.classificationLabel || undefined,
    author: filters.author || undefined,
  });
}