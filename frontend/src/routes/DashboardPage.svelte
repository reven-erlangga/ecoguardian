<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboardStore } from '$modules/dashboard/stores/dashboard.stores';
  import StatsGrid from '$modules/dashboard/parts/stats-grid/StatsGrid.svelte';
  import RecentTweets from '$modules/dashboard/parts/recent-tweets/RecentTweets.svelte';
  import RecentIssues from '$modules/dashboard/parts/recent-issues/RecentIssues.svelte';
  import BlockchainStatus from '$modules/dashboard/parts/blockchain-status/BlockchainStatus.svelte';

  let { navigate }: { navigate: (href: string) => void } = $props();

  onMount(() => {
    dashboardStore.actions.fetch();
  });
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-heading">Dashboard</h1>
    <p class="text-muted-foreground">Ringkasan aktivitas Ecoguard</p>
  </div>

  <StatsGrid />

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <RecentTweets />
      <RecentIssues />
    </div>
    <div class="space-y-6">
      <BlockchainStatus />
    </div>
  </div>
</div>