import { authStore } from '../../stores/auth.store.svelte';

export function useLoginForm() {
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit() {
    loading = true;
    error = '';
    try {
      await authStore.login(email, password);
      window.location.href = '/dashboard';
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  return { email, password, error, loading, submit };
}
