<script lang="ts">
  import { issueStore } from '$modules/issues/stores/issue.stores';
  import Search from '@components/molecules/search/Search.svelte';
  import StatusFilter from './StatusFilter.svelte';
  import Pagination from '@components/atoms/pagination/Pagination.svelte';
  import IssueList from '$modules/issues/parts/issue-list/IssueList.svelte';
  import IssueStats from '$modules/issues/parts/issue-stats/IssueStats.svelte';
  import WordCloud from '$modules/issues/parts/word-cloud/WordCloud.svelte';
  import Map from '@components/atoms/map/Map.svelte';
  import { PER_PAGE } from '$modules/issues/parts/issue-list/issue-list.components';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let { navigate }: { navigate: (href: string) => void } = $props();

  let page = $state(1);
  const totalPages = $derived(Math.max(1, Math.ceil(issueStore.list.data.total / PER_PAGE)));

  function goTo(p: number) {
    page = p;
    issueStore.actions.fetch(page, PER_PAGE);
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-heading">Issues</h1>
    <p class="text-muted-foreground">Laporan masalah lingkungan yang masuk</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <IssueStats />
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <Search placeholder="Cari issue…" debounceMs={500} />
          </div>
          <StatusFilter />
        </div>
        <IssueList />
        <Pagination {page} {totalPages} total={issueStore.list.data.total} onchange={goTo} />
      </div>
    </div>
    <div class="space-y-6">
      <WordCloud />
      <Map variant="cluster" markers={issueStore.list.data.issues.filter((i: any) => i.location?.lat && i.location?.lon).map((i: any) => ({ id: i.id, lat: i.location.lat, lon: i.location.lon, type: i.type, address: i.location.address }))} />
    </div>
  </div>
</div>
