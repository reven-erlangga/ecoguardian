<script lang="ts">
  import { onMount } from 'svelte';
  import { issueStore } from '$modules/issues/stores/issue.stores';
  import ResolvedCard from '$modules/issues/parts/resolved-card/ResolvedCard.svelte';
  import NotResolvedCard from '$modules/issues/parts/not-resolved-card/NotResolvedCard.svelte';

  onMount(() => issueStore.actions.fetchStats());
</script>

<div class="grid grid-cols-2 gap-4">
  <ResolvedCard count={issueStore.stats.data.resolvedCount} loading={issueStore.stats.meta.loading} />
  <NotResolvedCard count={issueStore.stats.data.openCount} loading={issueStore.stats.meta.loading} />
</div>
