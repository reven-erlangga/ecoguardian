<script lang="ts">
  import { authStore } from '../../stores/auth.store.svelte';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';
    try {
      await authStore.login(email, password);
      window.location.href = '/dashboard';
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={submit} class="space-y-4">
  <div>
    <label for="email" class="block text-sm font-medium text-foreground">Email</label>
    <input id="email" type="email" required bind:value={email}
      class="mt-1 block w-full neo-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
  <div>
    <label for="password" class="block text-sm font-medium text-foreground">Password</label>
    <input id="password" type="password" required bind:value={password}
      class="mt-1 block w-full neo-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
  {#if error}
    <p class="text-sm text-red-500">{error}</p>
  {/if}
  <button type="submit" disabled={loading}
    class="neo-border neo-shadow w-full bg-blue-600 text-white px-4 py-3 font-bold text-base hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all duration-100">
    {loading ? 'Loading...' : 'Masuk'}
  </button>
</form>
