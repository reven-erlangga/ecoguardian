import { authStore } from '../../stores/auth.store.svelte';

export function useRegisterForm() {
  let email = $state('');
  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit() {
    loading = true;
    error = '';
    try {
      await authStore.register(email, username, password);
      window.location.href = '/dashboard';
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  return { email, username, password, error, loading, submit };
}
