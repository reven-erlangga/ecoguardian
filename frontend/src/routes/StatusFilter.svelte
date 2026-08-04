<script lang="ts">
  import { issueStore } from '$modules/issues/stores/issue.stores';
  import Dropdown from '@components/atoms/dropdown/Dropdown.svelte';
  import FilterIcon from 'phosphor-svelte/lib/FunnelIcon';

  const options = [
    { value: 'all', label: 'Semua' },
    { value: 'open', label: 'Belum Selesai' },
    { value: 'resolved', label: 'Sudah Selesai' },
  ] as const;

  function onChange(v: string) {
    issueStore.list.data.statusFilter = v as 'all' | 'open' | 'resolved';
    issueStore.actions.fetch(1, 5);
  }
</script>

<Dropdown items={[...options]} selected={issueStore.list.data.statusFilter} onchange={onChange} label="Filter: Semua">
  {#snippet icon()}<FilterIcon class="size-4" />{/snippet}
</Dropdown>
