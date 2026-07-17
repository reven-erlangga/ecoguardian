<script lang="ts">
  import type { AppShellProps } from './app-shell.types';
  import { useAppShell } from './app-shell.component';
  import Navigation from '@components/organisms/navigation/navigation.svelte';

  let { currentPath, children, onLogout }: AppShellProps = $props();
  useAppShell({ currentPath, onLogout });
</script>

<div class="flex">
  <Navigation {currentPath} {onLogout} />
  <main class="flex-1 p-8">
    {@render children?.()}
  </main>
</div>
