import { tweetStore } from '../../stores/tweet.store.svelte';
import { LABELS } from '@shared/constants';

export function useTweetFilter() {
  let keyword = $state('');
  let classificationLabel = $state('');
  let author = $state('');

  async function apply() {
    tweetStore.setPage(1);
    await tweetStore.fetch({
      keyword: keyword || undefined,
      classificationLabel: classificationLabel || undefined,
      author: author || undefined,
    });
  }

  function reset() {
    keyword = '';
    classificationLabel = '';
    author = '';
    apply();
  }

  return { keyword, classificationLabel, author, labels: LABELS, apply, reset };
}
