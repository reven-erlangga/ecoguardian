<script lang="ts">
  import { onMount } from 'svelte';
  import { getTwitterCredentialsStatus, saveOAuth2Token, testOAuth2Token } from '$modules/settings/services/settings.service';
  import type { CredentialsStatus } from '$modules/settings/services/settings.service';

  let { navigate }: { navigate: (href: string) => void } = $props();

  let configured = $state(false);
  let statusError = $state('');

  // Test token
  let testing = $state(false);
  let testResult = $state<{ ok: boolean; msg: string } | null>(null);

  // OAuth2 form
  let accessToken = $state('');
  let refreshToken = $state('');
  let clientId = $state('');
  let clientSecret = $state('');
  let saving = $state(false);
  let error = $state('');
  let success = $state('');

  onMount(async () => {
    try {
      const status: CredentialsStatus = await getTwitterCredentialsStatus();
      configured = status.configured;
    } catch {
      statusError = 'Tidak dapat memeriksa status kredensial.';
    }
  });

  async function handleSave() {
    if (!accessToken || !refreshToken || !clientId || !clientSecret) {
      error = 'Access Token, Refresh Token, Client ID, dan Client Secret wajib diisi';
      return;
    }
    saving = true;
    error = '';
    success = '';
    try {
      await saveOAuth2Token({
        access_token: accessToken.trim(),
        refresh_token: refreshToken.trim(),
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
      });
      configured = true;
      success = 'Token OAuth2 berhasil disimpan!';
      accessToken = refreshToken = clientId = clientSecret = '';
    } catch (e: any) {
      error = e.message ?? 'Gagal menyimpan token';
    } finally {
      saving = false;
    }
  }

  async function handleTest() {
    testing = true;
    testResult = null;
    try {
      const r = await testOAuth2Token();
      if (r.valid) {
        testResult = { ok: true, msg: `Token valid (${r.username || 'ok'})` };
      } else {
        testResult = { ok: false, msg: `Token tidak valid (${r.detail || r.error || r.status || 'unknown'})` };
      }
    } catch (e: any) {
      testResult = { ok: false, msg: 'Gagal test token: ' + (e.message || e) };
    } finally {
      testing = false;
    }
  }
</script>

<div class="max-w-xl space-y-6">
  <h1 class="text-3xl font-heading">Pengaturan</h1>

  <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6 space-y-4">
    <h2 class="text-xl font-heading">Twitter API — OAuth 2.0</h2>

    {#if statusError}
      <div class="border-2 border-red-500 rounded-base bg-red-100 p-3 text-sm text-red-800">
        {statusError}
      </div>
    {:else}
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full {configured ? 'bg-green-500' : 'bg-gray-300'}"></span>
        <span class="text-sm font-medium">
          {configured ? 'Kredensial OAuth2 sudah dikonfigurasi (tersimpan di database).' : 'Kredensial OAuth2 belum dikonfigurasi.'}
        </span>
      </div>
    {/if}

    <p class="text-sm text-gray-600">
      Masukkan token OAuth 2.0 dari Twitter Developer Portal. Token disimpan di <strong>database</strong>
      dan otomatis di-refresh oleh service (tanpa perlu set manual lagi).
      Scope yang dibutuhkan: <code class="font-mono bg-gray-100 px-1 rounded">tweet.read tweet.write users.read offline.access</code>
    </p>

    <div class="space-y-3">
      <div>
        <label for="access-token" class="block text-sm font-medium mb-1">Access Token</label>
        <input id="access-token" type="password" bind:value={accessToken} placeholder="access_token"
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 font-mono text-xs" />
      </div>
      <div>
        <label for="refresh-token" class="block text-sm font-medium mb-1">Refresh Token</label>
        <input id="refresh-token" type="password" bind:value={refreshToken} placeholder="refresh_token"
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 font-mono text-xs" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="client-id" class="block text-sm font-medium mb-1">Client ID</label>
          <input id="client-id" type="text" bind:value={clientId} placeholder="client_id"
            class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 font-mono text-xs" />
        </div>
        <div>
          <label for="client-secret" class="block text-sm font-medium mb-1">Client Secret</label>
          <input id="client-secret" type="password" bind:value={clientSecret} placeholder="client_secret"
            class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 font-mono text-xs" />
        </div>
      </div>
    </div>

    {#if error}
      <div class="border-2 border-red-500 rounded-base bg-red-100 p-3 text-sm text-red-800">{error}</div>
    {/if}
    {#if success}
      <div class="border-2 border-green-500 rounded-base bg-green-100 p-3 text-sm text-green-800">{success}</div>
    {/if}

    <button onclick={handleSave} disabled={saving}
      class="w-full border-2 border-border rounded-base bg-yellow-300 px-4 py-2 font-heading text-lg shadow-shadow hover:bg-yellow-400 disabled:opacity-50">
      {saving ? 'Menyimpan...' : 'Simpan Token OAuth2'}
    </button>

    <button onclick={handleTest} disabled={testing}
      class="w-full border-2 border-border rounded-base bg-blue-100 px-4 py-2 font-heading text-base shadow-shadow hover:bg-blue-200 disabled:opacity-50">
      {testing ? 'Mengecek...' : 'Test Token (valid / tidak?)'}
    </button>

    {#if testResult}
      <div class="border-2 border-border rounded-base p-3 text-sm font-heading {testResult.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
        {testResult.msg}
      </div>
    {/if}
  </div>

  <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6 space-y-2">
    <h2 class="text-xl font-heading">Butuh Bantuan?</h2>
    <p class="text-sm text-gray-600">
      Dapatkan kredensial Twitter API di
      <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer"
        class="text-blue-600 underline">Twitter Developer Portal</a>.
      Pastikan scope <code class="font-mono bg-gray-100 px-1 rounded">offline.access</code> dicentang agar refresh token bisa dipakai.
    </p>
  </div>
</div>
