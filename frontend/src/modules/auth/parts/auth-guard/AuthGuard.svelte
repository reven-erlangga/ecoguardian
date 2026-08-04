<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../../stores/auth.stores';
  import { userStore } from '../../stores/user.stores';
  import type { AuthGuardProps } from './auth-guard.types';

  let { children }: AuthGuardProps = $props();

  // ponytail: flag rehydrate sekali saja — navigasi SPA gak perlu re-fire tiap page swap
  let _rehydrated = false;

  onMount(async () => {
    if (_rehydrated) return;
    _rehydrated = true;
    await authStore.actions.rehydrate();
    await userStore.actions.checkFirstUser();
  });
</script>

{@render children?.()}
