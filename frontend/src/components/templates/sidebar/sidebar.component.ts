import HouseLineIcon from 'phosphor-svelte/lib/HouseLineIcon';
import BellIcon from 'phosphor-svelte/lib/BellIcon';
import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
import GearIcon from 'phosphor-svelte/lib/GearIcon';
import type { SidebarGroup } from './sidebar.types';

export const groups: SidebarGroup[] = [
  {
    label: 'Menu',
    items: [
      { href: '/dashboard', label: 'Dashboard', iconComponent: HouseLineIcon },
      { href: '/notifications', label: 'Notifikasi', iconComponent: BellIcon },
      { href: '/issues', label: 'Issues', iconComponent: MapPinIcon },
      { href: '/blockchain', label: 'Blockchain', iconComponent: CubeIcon },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { href: '/settings', label: 'Pengaturan', iconComponent: GearIcon },
    ],
  },
];