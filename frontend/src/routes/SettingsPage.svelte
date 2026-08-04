<script lang="ts">
  import { onMount } from 'svelte';
  import { saveTwitterCredentials, getTwitterCredentialsStatus } from '$modules/settings/services/settings.service';
  import type { CredentialsStatus } from '$modules/settings/services/settings.service';

  let { navigate }: { navigate: (href: string) => void } = $props();

  let apiKey = $state('');
  let apiSecret = $state('');
  let bearerToken = $state('');
  let configured = $state(false);
  let saving = $state(false);
  let error = $state('');
  let success = $state('');

  onMount(async () => {
    try {
      const status: CredentialsStatus = await getTwitterCredentialsStatus();
      configured = status.configured;
    } catch {
      // Vault/twitter-service may not be reachable
    }
  });

  async function handleSave() {
    if (!apiKey || !apiSecret) {
      error = 'API Key dan API Secret wajib diisi';
      return;
    }
    saving = true;
    error = '';
    success = '';
    try {
      await saveTwitterCredentials({
        api_key: apiKey,
        api_secret: apiSecret,
        bearer_token: bearerToken || undefined,
      });
      configured = true;
      success = 'Kredensial Twitter berhasil disimpan!';
      apiKey = '';
      apiSecret = '';
      bearerToken = '';
    } catch (e: any) {
      error = e.message ?? 'Gagal menyimpan kredensial';
    } finally {
      saving = false;
    }
  }
</script>

<div class="max-w-xl space-y-6">
  <h1 class="text-3xl font-heading">Pengaturan</h1>

  {#if configured}
    <div class="border-2 border-border rounded-base bg-green-100 p-4 shadow-shadow">
      <p class="font-medium text-green-800">✓ Kredensial Twitter sudah dikonfigurasi</p>
      <p class="text-sm text-green-700 mt-1">Untuk memperbarui, isi form di bawah dan simpan.</p>
    </div>
  {/if}

  <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6 space-y-4">
    <h2 class="text-xl font-heading">Twitter API</h2>
    <p class="text-sm text-gray-600">
      Masukkan kredensial Twitter API untuk mengaktifkan pencarian dan pemantauan Twitter.
      Kredensial disimpan di Vault (infra penyimpanan rahasia).
    </p>

    <div class="space-y-3">
      <div>
        <label for="api-key" class="block text-sm font-medium mb-1">API Key</label>
        <input
          id="api-key"
          type="text"
          bind:value={apiKey}
          placeholder="Masukkan Twitter API Key"
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>
      <div>
        <label for="api-secret" class="block text-sm font-medium mb-1">API Secret</label>
        <input
          id="api-secret"
          type="password"
          bind:value={apiSecret}
          placeholder="Masukkan Twitter API Secret"
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>
      <div>
        <label for="bearer-token" class="block text-sm font-medium mb-1">
          Bearer Token <span class="text-gray-400">(opsional)</span>
        </label>
        <input
          id="bearer-token"
          type="password"
          bind:value={bearerToken}
          placeholder="Masukkan Bearer Token (opsional)"
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>
    </div>

    {#if error}
      <div class="border-2 border-red-500 rounded-base bg-red-100 p-3 text-sm text-red-800">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="border-2 border-green-500 rounded-base bg-green-100 p-3 text-sm text-green-800">
        {success}
      </div>
    {/if}

    <button
      onclick={handleSave}
      disabled={saving}
      class="w-full border-2 border-border rounded-base bg-yellow-300 px-4 py-2 font-heading text-lg shadow-shadow hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? 'Menyimpan...' : 'Simpan Kredensial'}
    </button>
  </div>

  <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6 space-y-2">
    <h2 class="text-xl font-heading">Butuh Bantuan?</h2>
    <p class="text-sm text-gray-600">
      Dapatkan kredensial Twitter API di
      <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer"
        class="text-blue-600 underline">Twitter Developer Portal</a>.
      Pastikan akun Twitter Anda memiliki akses ke API v2.
    </p>
  </div>
</div>
