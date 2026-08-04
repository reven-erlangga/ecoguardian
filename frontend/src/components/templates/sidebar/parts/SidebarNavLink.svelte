<script lang="ts">
  import { navigate } from '@shared/utils/navigate';
  import type { SidebarItem } from '../sidebar.types';

  let { item, currentPath }: { item: SidebarItem; currentPath: string } = $props();

  const isActive = $derived(
    currentPath === item.href ||
    (currentPath.startsWith(item.href) && item.href !== '/' && currentPath[item.href.length] === '/')
  );

  function go(e: Event) {
    e.preventDefault();
    if (currentPath === item.href) return;
    navigate(item.href);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = $derived(item.iconComponent as any);
</script>

<a
  href={item.href}
  onclick={go}
  class="flex w-full items-center gap-2 overflow-hidden rounded-base p-2 text-sm font-base transition-colors text-left {isActive
    ? 'bg-main text-main-foreground shadow-shadow border-2 border-border'
    : 'text-sidebar-foreground hover:bg-main hover:text-main-foreground hover:border-2 hover:border-border'}"
>
  {#if IconComponent}
    <IconComponent class="size-4 shrink-0" />
  {/if}
  <span class="truncate">{item.label}</span>
</a>