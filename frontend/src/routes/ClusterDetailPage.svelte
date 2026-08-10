<script lang="ts">
  import { onMount } from 'svelte';
  import { listClusters, getIssue } from '$modules/issues/services/issue.service';
  import type { Cluster, Issue } from '$modules/issues/types';
  import { navigate } from '@shared/utils/navigate';
  import Map from '@components/atoms/map/Map.svelte';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
  import { typeIcons, typeLabels } from '$modules/issues/parts/issue-card/issue-card.components';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let { clusterId }: { clusterId: string; navigate?: (href: string) => void } = $props();

  let cluster = $state<Cluster | null>(null);
  let issues = $state<Issue[]>([]);
  let loading = $state(true);
  let error = $state('');

  function iconFor(type: string) { return typeIcons[type] || WarningCircleIcon; }
  function labelFor(type: string) { return typeLabels[type] || type; }

  async function load() {
    loading = true;
    error = '';
    try {
      const clusters = await listClusters();
      const found = clusters.find((c) => c.clusterId === clusterId) ?? null;
      if (!found) { error = 'Cluster tidak ditemukan.'; loading = false; return; }
      cluster = found;
      const fetched = await Promise.all(found.issueIds.map((id) => getIssue(id)));
      issues = fetched.filter(Boolean) as Issue[];
    } catch (e: any) {
      error = e?.message || 'Gagal memuat detail cluster.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    load();
    document.addEventListener('astro:page-load', load);
    return () => document.removeEventListener('astro:page-load', load);
  });
</script>

<div class="space-y-6">
  <a href="/issues" onclick={(e) => { e.preventDefault(); navigate('/issues'); }} class="inline-flex items-center gap-1 text-sm font-heading border-2 border-border rounded-base bg-secondary-background px-4 py-2 hover:bg-gray-100 w-fit">
    <ArrowLeftIcon size={16} weight="bold" />
    Kembali
  </a>

  {#if loading}
    <div class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded-base w-1/3 border-2 border-border"></div>
      <div class="h-72 bg-gray-100 rounded-base border-2 border-border"></div>
      <div class="h-32 bg-gray-200 rounded-base border-2 border-border"></div>
    </div>
  {:else if error}
    <div class="border-2 border-border rounded-base bg-destructive/20 text-destructive-foreground font-heading p-4">{error}</div>
  {:else if cluster}
    <div>
      <h1 class="text-3xl font-heading">Cluster Laporan</h1>
      <p class="text-muted-foreground">{cluster.address}</p>
    </div>

    <!-- Map: titik-titik issue dalam cluster -->
    <div>
      <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
        <MapPinIcon size={16} weight="bold" /> Peta Cluster ({cluster.issueCount} issue)
      </h3>
      <Map variant="cluster" markers={issues.filter((i: any) => i.location?.lat && i.location?.lon).map((i: any) => ({ id: i.id, lat: i.location.lat, lon: i.location.lon, type: i.type, address: i.location.address }))} height="380px" />
    </div>

    <!-- Daftar issue dalam cluster -->
    <div>
      <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide mb-3">Issue dalam Cluster</h3>
      {#if issues.length === 0}
        <div class="border-2 border-border rounded-base bg-gray-50 p-6 text-center text-sm text-gray-400">Tidak ada issue dalam cluster ini.</div>
      {:else}
        <div class="space-y-3">
          {#each issues as issue (issue.id)}
            <button
              onclick={() => navigate(`/issues/${issue.id}`)}
              class="w-full text-left border-2 border-border rounded-base bg-secondary-background p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-border bg-blue-100 flex-shrink-0">
                <svelte:component this={iconFor(issue.type)} size={22} weight="bold" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-heading text-sm">{labelFor(issue.type)}</span>
                  <span class="text-xs font-heading px-2 py-0.5 border-2 border-border rounded-base {issue.status === 'resolved' ? 'bg-green-200' : 'bg-yellow-200'}">
                    {issue.status === 'resolved' ? 'Resolved' : 'Open'}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground mt-1 truncate">{issue.location?.address || 'Lokasi tidak diketahui'}</p>
                <p class="text-sm text-foreground mt-1 line-clamp-2">{issue.paraphrasedText}</p>
              </div>
              <CaretRightIcon size={16} weight="bold" class="text-gray-400 mt-1 flex-shrink-0" />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
