<script lang="ts">
  import SidebarNavGroup from './parts/SidebarNavGroup.svelte';
  import SidebarUserDropdown from './parts/SidebarUserDropdown.svelte';
  import { groups as sidebarGroups } from './sidebar.component';
  import type { SidebarProps, SidebarGroup } from './sidebar.types';

  let { currentPath }: SidebarProps = $props();

  const navGroups: SidebarGroup[] = sidebarGroups;
</script>

<div data-slot="sidebar" data-state="expanded" data-side="left" class="w-72 bg-sidebar border-r-2 border-r-border h-screen sticky top-0 flex-shrink-0 flex flex-col">
  <div data-slot="sidebar-header" class="flex flex-col gap-2 p-2 border-b-2 border-b-border">
    <h1 class="text-xl font-heading px-3 py-2">Ecoguard</h1>
  </div>

  <div data-slot="sidebar-content" class="flex min-h-0 flex-1 flex-col overflow-auto">
    {#each navGroups as group}
      <SidebarNavGroup {group} {currentPath} />
    {/each}
  </div>

  <div data-slot="sidebar-footer" class="flex flex-col gap-2 p-2 border-t-2 border-t-border">
    <SidebarUserDropdown />
  </div>
</div>
