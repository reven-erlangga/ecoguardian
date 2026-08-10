<script lang="ts">
  import { onMount } from 'svelte';
  import { issueStore } from '$modules/issues/stores/issue.stores';
  import IssueStats from '$modules/issues/parts/issue-stats/IssueStats.svelte';
  import Map from '@components/atoms/map/Map.svelte';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import { typeIcons, typeLabels } from '$modules/issues/parts/issue-card/issue-card.components';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let { navigate }: { navigate: (href: string) => void } = $props();

  const clusters = $derived(issueStore.list.data.clusters);
  const meta = $derived(issueStore.list.meta);

  function iconFor(type: string) { return typeIcons[type] || null; }
  function labelFor(type: string) { return typeLabels[type] || type; }
  function topType(cluster: any) { return cluster.types?.[0] || 'unknown'; }

  onMount(() => {
    issueStore.actions.fetchStats();
    issueStore.actions.fetchClusters();
    document.addEventListener('astro:page-load', () => {
      issueStore.actions.fetchStats();
      issueStore.actions.fetchClusters();
    });
    return () => document.removeEventListener('astro:page-load', () => {});
  });
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-heading">Issues</h1>
    <p class="text-muted-foreground">Laporan masalah lingkungan dikelompokkan per cluster lokasi</p>
  </div>

  <IssueStats />

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Daftar cluster -->
    <div class="lg:col-span-2 space-y-3">
      {#if meta.message && clusters.length === 0}
        <div class="border-2 border-border rounded-base bg-destructive/20 text-destructive-foreground font-heading p-4">
          {meta.message}
        </div>
      {:else if clusters.length === 0}
        <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div class="w-24 h-24 rounded-full bg-gray-100 border-2 border-border flex items-center justify-center mx-auto mb-6">
            <MapPinIcon size={48} weight="duotone" color="#2563EB" />
          </div>
          <h3 class="text-xl font-heading mb-2">Tidak Ada Cluster</h3>
          <p class="text-muted-foreground mb-6 max-w-md">Belum ada laporan dengan lokasi yang ter-klasterisasi.</p>
        </div>
      {:else}
        {#each clusters as cluster (cluster.clusterId)}
          {@const Icon = iconFor(topType(cluster))}
          <button
            onclick={() => navigate(`/issues/cluster/${cluster.clusterId}`)}
            class="w-full text-left border-2 border-border rounded-base bg-secondary-background p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span class="w-12 h-12 rounded-full flex items-center justify-center border-2 border-border bg-blue-100 flex-shrink-0">
              {#if Icon}
                <Icon size={26} weight="bold" />
              {:else}
                <MapPinIcon size={26} weight="bold" />
              {/if}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="font-heading text-sm truncate">{cluster.address}</h4>
                <span class="text-xs font-heading px-2 py-0.5 border-2 border-border rounded-base bg-yellow-200 flex-shrink-0">
                  {cluster.issueCount} issue
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                {cluster.types.map(labelFor).join(', ')}
              </p>
            </div>
            <CaretRightIcon size={18} weight="bold" class="text-gray-400 flex-shrink-0" />
          </button>
        {/each}
      {/if}
    </div>

    <!-- Peta cluster -->
    <div>
      <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
        <MapPinIcon size={16} weight="bold" /> Peta Cluster
      </h3>
      <Map variant="cluster" markers={clusters.map((c) => ({ id: c.clusterId, lat: c.lat, lon: c.lon, type: topType(c), address: c.address }))} height="420px" />
    </div>
  </div>
</div>
