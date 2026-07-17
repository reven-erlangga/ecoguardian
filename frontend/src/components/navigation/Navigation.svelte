<script lang="ts">
  import type { NavigationProps } from './navigation.types';
  import NavItem from '$components/nav-item/NavItem.svelte';
  import HouseIcon from 'phosphor-svelte/lib/HouseIcon';
  import ChatTextIcon from 'phosphor-svelte/lib/ChatTextIcon';
  import BellIcon from 'phosphor-svelte/lib/BellIcon';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';

  let { currentPath, onLogout }: NavigationProps = $props();

  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: HouseIcon },
    { href: '/tweets', label: 'Tweets', icon: ChatTextIcon },
    { href: '/notifications', label: 'Notifikasi', icon: BellIcon },
    { href: '/issues', label: 'Issues', icon: MapPinIcon },
    { href: '/blockchain', label: 'Blockchain', icon: CubeIcon },
  ];
</script>

<aside class="w-64 bg-white neo-border neo-shadow min-h-screen p-4 flex flex-col gap-2">
  <h1 class="text-2xl font-bold neo-border px-4 py-3 bg-yellow-300 mb-4">Ecoguard</h1>
  {#each items as item}
    <NavItem href={item.href} label={item.label} active={currentPath === item.href}>
      <item.icon size={22} weight="bold" />
    </NavItem>
  {/each}
  <div class="mt-auto">
    <button onclick={onLogout}
      class="w-full neo-border bg-red-500 text-white px-4 py-3 font-bold hover:bg-red-600 flex items-center gap-3">
      <span class="text-lg">🚪</span>
      <span>Logout</span>
    </button>
  </div>
</aside>
