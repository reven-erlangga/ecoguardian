<script lang="ts">
  import { onMount } from 'svelte';
  import { issueStore } from '../../stores/issue.store.svelte';
  import IssueCard from '../issue-card/IssueCard.svelte';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import type { Cluster } from '../../types';

  let page = $state(1);
  const PER_PAGE = 10;

  let issuesByCluster = $derived.by(() => {
    const clusters = issueStore.clusters;
    if (!clusters.length) return [];

    return clusters.map((c: Cluster) => ({
      cluster: c,
      issues: issueStore.issues.filter((i) => i.location?.address === c.address),
    }));
  });

  const totalPages = $derived(Math.max(1, Math.ceil(issueStore.total / PER_PAGE)));

  function prevPage() {
    if (page > 1) {
      page--;
      issueStore.fetch(page, PER_PAGE);
    }
  }

  function nextPage() {
    if (page < totalPages) {
      page++;
      issueStore.fetch(page, PER_PAGE);
    }
  }

  onMount(() => {
    issueStore.fetchClusters();
    issueStore.fetch(page, PER_PAGE);
  });
</script>

<div class="space-y-8">
  {#if issueStore.loading && issuesByCluster.length === 0}
    <div class="text-center py-16">
      <p class="text-gray-500 font-bold">Memuat laporan...</p>
    </div>
  {:else if issuesByCluster.length === 0}
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-24 h-24 rounded-full bg-gray-100 neo-border flex items-center justify-center mx-auto mb-6">
        <MapPinIcon size={48} weight="duotone" color="#2563EB" />
      </div>
      <h3 class="text-xl font-bold mb-2">Tidak Ada Laporan</h3>
      <p class="text-gray-500 mb-6 max-w-md">Belum ada laporan masalah lingkungan yang masuk.</p>
    </div>
  {:else}
    {#each issuesByCluster as group}
      <section class="neo-border bg-white neo-shadow overflow-hidden">
        <div class="bg-blue-600 text-white px-5 py-3 flex items-center justify-between">
          <h3 class="font-bold flex items-center gap-2">
            <MapPinIcon size={20} weight="bold" />
            {group.cluster.address}
          </h3>
          <span class="text-xs bg-white text-blue-700 font-bold px-2.5 py-1 neo-border">
            {group.cluster.issue_count} laporan
          </span>
        </div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each group.issues as issue (issue.id)}
            <IssueCard {issue} />
          {/each}
        </div>
        {#if group.issues.length === 0}
          <p class="text-gray-400 text-sm p-4">Tidak ada laporan di cluster ini.</p>
        {/if}
      </section>
    {/each}

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex items-center justify-center gap-4">
        <button
          onclick={prevPage}
          disabled={page <= 1}
          class="neo-border bg-white px-4 py-2 font-bold flex items-center gap-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CaretLeftIcon size={16} weight="bold" />
          Sebelumnya
        </button>
        <span class="text-sm font-mono bg-gray-100 neo-border px-3 py-1">
          Halaman {page} / {totalPages}
        </span>
        <button
          onclick={nextPage}
          disabled={page >= totalPages}
          class="neo-border bg-white px-4 py-2 font-bold flex items-center gap-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Berikutnya
          <CaretRightIcon size={16} weight="bold" />
        </button>
      </div>
    {/if}
  {/if}
</div>
