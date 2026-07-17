import type { Snippet } from 'svelte';

export interface AppShellProps {
  currentPath: string;
  children?: Snippet;
  onLogout?: () => void;
}
