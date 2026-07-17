import type { AppShellProps } from './app-shell.types';

export function useAppShell(p: AppShellProps) {
  return { currentPath: p.currentPath, onLogout: p.onLogout };
}
