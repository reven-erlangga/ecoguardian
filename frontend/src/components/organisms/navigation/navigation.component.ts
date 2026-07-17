import type { NavigationProps, NavItem } from './navigation.types';

const items: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/notifications', label: 'Notifikasi', icon: '🔔' },
  { href: '/issues', label: 'Issues', icon: '📍' },
  { href: '/blockchain', label: 'Blockchain', icon: '⛓️' },
];

export function useNavigation(p: NavigationProps) {
  return { items, currentPath: p.currentPath };
}
