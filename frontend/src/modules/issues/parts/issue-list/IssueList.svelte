<script lang="ts">
  import { onMount } from 'svelte';
  import { issueStore } from '$modules/issues/stores/issue.stores';
  import IssueCard from '$modules/issues/parts/issue-card/IssueCard.svelte';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import { PER_PAGE } from './issue-list.components';

  let page = $state(1);

  const totalPages = $derived(Math.max(1, Math.ceil(issueStore.list.data.total / PER_PAGE)));

  // ponytail: publish page + totalPages ke DOM attribute + dispatch event biar React Pagination island bisa baca
  $effect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.issuePage = String(page);
    document.documentElement.dataset.issueTotalPages = String(totalPages);
    const total = issueStore.list.data.total;
    document.documentElement.dataset.issueTotal = String(total);
    document.dispatchEvent(new CustomEvent('issue:meta', { detail: { page, totalPages, total } }));
  });

  function onFilterChange(e: Event) {
    const detail = (e as CustomEvent<'all' | 'open' | 'resolved'>).detail;
    page = 1;
    issueStore.list.data.statusFilter = detail;
    issueStore.actions.fetch(page, PER_PAGE);
  }

  function onPageChange(e: Event) {
    const p = (e as CustomEvent<number>).detail;
    if (p === page) return;
    page = p;
    issueStore.actions.fetch(page, PER_PAGE);
  }

  function onSearchChange(e: Event) {
    const q = (e as CustomEvent<string>).detail;
    issueStore.actions.setSearchQuery(q);
  }

  onMount(() => {
    issueStore.actions.fetch(page, PER_PAGE);
    issueStore.actions.startPolling(page, PER_PAGE);
    const onPageLoad = () => { issueStore.actions.fetch(page, PER_PAGE); issueStore.actions.startPolling(page, PER_PAGE); };
    document.addEventListener('astro:page-load', onPageLoad);
    document.addEventListener('issue:filter', onFilterChange);
    document.addEventListener('issue:page', onPageChange);
    document.addEventListener('search:change', onSearchChange);
    return () => {
      issueStore.actions.stopPolling();
      document.removeEventListener('astro:page-load', onPageLoad);
      document.removeEventListener('issue:filter', onFilterChange);
      document.removeEventListener('issue:page', onPageChange);
      document.removeEventListener('search:change', onSearchChange);
    };
  });

  // ponytail: client-side filter dari searchQuery — BE belum support keyword, filter dari issues halaman ini
  const filteredIssues = $derived.by(() => {
    const q = issueStore.list.data.searchQuery.trim().toLowerCase();
    if (!q) return issueStore.list.data.issues;
    return issueStore.list.data.issues.filter((it) => {
          const hay = [
            it.paraphrasedText,
            it.type,
            it.status,
            it.tweetId,
            it.location?.address,
          ].filter(Boolean).join(' ').toLowerCase();
          return hay.includes(q);
        });
  });
</script>

<div class="space-y-4">
  {#if issueStore.list.meta.message && issueStore.list.data.issues.length === 0}
    <div class="border-2 border-border rounded-base bg-destructive/20 text-destructive-foreground font-heading p-4">
      {issueStore.list.meta.message}
    </div>
  {:else if issueStore.list.meta.loading && issueStore.list.data.issues.length === 0}
    <div class="space-y-3">
      {#each Array(5) as _}
        <div class="border-2 border-border rounded-base bg-secondary-background p-4 flex flex-col gap-3 animate-pulse">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-border"></div>
              <div class="space-y-1.5">
                <div class="h-4 bg-gray-200 rounded w-24"></div>
                <div class="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div class="h-6 bg-gray-200 rounded rounded-base w-14 border-2 border-border"></div>
          </div>
          <div class="space-y-1.5">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div class="h-5 bg-gray-200 rounded rounded-base w-20 border-2 border-border"></div>
        </div>
      {/each}
    </div>
  {:else if issueStore.list.data.issues.length === 0 && issueStore.list.data.searchQuery}
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 class="text-xl font-heading mb-2">Tidak Ditemukan</h3>
      <p class="text-muted-foreground">Pencarian "{issueStore.list.data.searchQuery}" tidak ditemukan.</p>
    </div>
  {:else if issueStore.list.data.issues.length === 0}
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-24 h-24 rounded-full bg-gray-100 border-2 border-border flex items-center justify-center mx-auto mb-6">
        <MapPinIcon size={48} weight="duotone" color="#2563EB" />
      </div>
      <h3 class="text-xl font-heading mb-2">Tidak Ada Laporan</h3>
      <p class="text-muted-foreground mb-6 max-w-md">Belum ada laporan masalah lingkungan yang masuk.</p>
    </div>
  {:else}
    {#if issueStore.list.meta.loading}
      <div class="space-y-3">
        {#each Array(5) as _}
          <div class="border-2 border-border rounded-base bg-secondary-background p-4 flex flex-col gap-3 animate-pulse">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-border"></div>
                <div class="space-y-1.5">
                  <div class="h-4 bg-gray-200 rounded w-24"></div>
                  <div class="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div class="h-6 bg-gray-200 rounded rounded-base w-14 border-2 border-border"></div>
            </div>
            <div class="space-y-1.5">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div class="h-5 bg-gray-200 rounded rounded-base w-20 border-2 border-border"></div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="space-y-3">
        {#each issueStore.list.data.issues as issue (issue.id)}
          <IssueCard {issue} />
        {/each}
      </div>
    {/if}
  {/if}
</div>
