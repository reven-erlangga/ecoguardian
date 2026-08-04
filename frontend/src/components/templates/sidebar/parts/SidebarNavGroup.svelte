<script lang="ts">
  import SidebarNavLink from './SidebarNavLink.svelte';
  import type { SidebarGroup, SidebarItem } from '../sidebar.types';

  let { group, currentPath }: { group: SidebarGroup; currentPath: string } = $props();

  // ponytail: derived dari prop agar reactivity track ketika group berubah
    const items = $derived(group.items);
</script>

<div data-slot="sidebar-group" class="relative flex w-full min-w-0 flex-col p-2 border-b-2 border-b-border last:border-b-0">
  {#if group.label}
    <div data-slot="sidebar-group-label" class="flex h-8 shrink-0 items-center rounded-base px-2 text-sm font-heading text-muted-foreground/70">{group.label}</div>
  {/if}
  <ul data-slot="sidebar-menu" class="flex w-full min-w-0 flex-col gap-1">
    {#each items as item}
      <li data-slot="sidebar-menu-item" class="group/menu-item relative font-base">
        <SidebarNavLink {item} {currentPath} />
      </li>
    {/each}
  </ul>
</div>
