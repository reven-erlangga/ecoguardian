<script lang="ts">
  import type { NavigationProps } from './navigation.types';
  import { useNavigation } from './navigation.component';
  import NavItem from '@components/nav-item/NavItem.svelte';

  let { currentPath, onLogout }: NavigationProps = $props();
  const { items } = useNavigation({ currentPath });
</script>

<aside class="w-64 bg-white neo-border neo-shadow min-h-screen p-4 flex flex-col gap-2">
  <h1 class="text-2xl font-bold neo-border px-4 py-3 bg-yellow-300 mb-4">
    Ecoguard
  </h1>
  {#each items as item}
    <NavItem
      href={item.href}
      label={item.label}
      icon={item.icon}
      active={currentPath === item.href}
    />
  {/each}
  <div class="mt-auto">
    <button
      onclick={onLogout}
      class="w-full neo-border bg-red-500 text-white px-4 py-3 font-bold hover:bg-red-600"
    >
      Logout
    </button>
  </div>
</aside>
