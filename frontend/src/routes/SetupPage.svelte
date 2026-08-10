<script lang="ts">
  import { onMount } from 'svelte';
  import { uploadImages } from '@shared/services/upload.service';
  import {
    getClusteringSettings,
    saveClusteringSettings,
    startRetrain,
    getRetrainStatus,
    getDatasetStats,
  } from '$modules/setup/services/setup.service';
  import type {
    ClusteringSettings,
    RetrainSample,
    RetrainStatus,
  } from '$modules/setup/services/setup.service';

  let { navigate }: { navigate: (href: string) => void } = $props();

  // ── Clustering ──
  let epsKm = $state(7.0);
  let minPts = $state(3);
  let clusterLoaded = $state(false);
  let saving = $state(false);
  let clusterMsg = $state('');
  let clusterErr = $state('');

  // ── Dataset & retrain ──
  const LABELS = ['flood', 'road_damage', 'fallen_tree', 'garbage', 'vandalism', 'kebakaran', 'longsor'];
  let label = $state('flood');
  let files: File[] = $state([]);
  let epochs = $state(20);
  let batchSize = $state(32);
  let samples: RetrainSample[] = $state([]);
  let datasetStats = $state<Record<string, number>>({});
  let status: RetrainStatus = $state({ status: 'idle' });
  let retrainMsg = $state('');
  let retrainErr = $state('');
  let uploading = $state(false);
  let starting = $state(false);
  let pollId: ReturnType<typeof setInterval> | undefined;

  async function refreshStatus() {
    try {
      status = await getRetrainStatus();
    } catch {
      // service mungkin belum reachable
    }
  }

  async function refresh() {
    try {
      const s: ClusteringSettings = await getClusteringSettings();
      epsKm = s.eps_km;
      minPts = s.min_pts;
      clusterLoaded = true;
    } catch {
      // default tetap dipakai
    }
    try {
      const st = await getDatasetStats();
      datasetStats = st.labels;
    } catch {}
    await refreshStatus();
  }

  onMount(() => {
    refresh();
    pollId = setInterval(refreshStatus, 2000);
    return () => {
      if (pollId) clearInterval(pollId);
    };
  });

  async function handleSaveClustering() {
    saving = true;
    clusterErr = '';
    clusterMsg = '';
    try {
      await saveClusteringSettings({ eps_km: epsKm, min_pts: minPts });
      clusterMsg = 'Setting clustering disimpan — berlaku langsung tanpa restart.';
    } catch (e: any) {
      clusterErr = e.message ?? 'Gagal menyimpan setting';
    } finally {
      saving = false;
    }
  }

  async function handleUpload() {
    if (!files.length) {
      retrainErr = 'Pilih file gambar terlebih dahulu';
      return;
    }
    uploading = true;
    retrainErr = '';
    retrainMsg = '';
    try {
      // Upload via Asset Service → ImageKit CDN (alur yang sama dgn laporan masuk)
      const urls = await uploadImages(files);
      const added = urls.filter(Boolean).map((url) => ({ label, url }));
      samples = [...samples, ...added];
      retrainMsg = `${added.length} gambar di-upload ke ImageKit (label: ${label}).`;
      files = [];
      const st = await getDatasetStats();
      datasetStats = st.labels;
    } catch (e: any) {
      retrainErr = e.message ?? 'Gagal upload gambar';
    } finally {
      uploading = false;
    }
  }

  function removeSample(index: number) {
    samples = samples.filter((_, i) => i !== index);
  }

  async function handleRetrain() {
    retrainErr = '';
    retrainMsg = '';
    starting = true;
    try {
      const r = await startRetrain(epochs, batchSize, samples);
      retrainMsg = 'Training ulang dimulai — pantau status di bawah.';
      samples = [];
      await refreshStatus();
    } catch (e: any) {
      retrainErr = e.message ?? 'Gagal memulai retrain';
    } finally {
      starting = false;
    }
  }
</script>

<div class="max-w-2xl space-y-6">
  <h1 class="text-3xl font-heading">Setup Awal</h1>
  <p class="text-sm text-gray-600">
    Konfigurasi parameter clustering dan training ulang model (ONNX). Pengaturan
    disimpan di MongoDB dan langsung berlaku tanpa restart.
  </p>

  {#if clusterMsg}
    <div class="border-2 border-green-500 rounded-base bg-green-100 p-3 text-sm text-green-800 shadow-shadow">
      {clusterMsg}
    </div>
  {/if}
  {#if clusterErr}
    <div class="border-2 border-red-500 rounded-base bg-red-100 p-3 text-sm text-red-800 shadow-shadow">
      {clusterErr}
    </div>
  {/if}

  <!-- ═══ Card 1: Clustering ═══ -->
  <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6 space-y-4">
    <h2 class="text-xl font-heading">Parameter Clustering (DBSCAN)</h2>
    <p class="text-sm text-gray-600">
      <b>Epsilon</b> = radius (km) laporan dianggap satu area; <b>MinPts</b> =
      jumlah minimal laporan agar area dianggap klaster. Nilai acuan riset:
      flood eps 45 km / MinPts 2, road-damage eps 1 km / MinPts 10.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="eps-km" class="block text-sm font-medium mb-1">Epsilon (km)</label>
        <input
          id="eps-km"
          type="number"
          min="0.1"
          step="0.1"
          bind:value={epsKm}
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>
      <div>
        <label for="min-pts" class="block text-sm font-medium mb-1">MinPts (min_samples)</label>
        <input
          id="min-pts"
          type="number"
          min="1"
          step="1"
          bind:value={minPts}
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>
    </div>

    {#if clusterLoaded}
      <p class="text-xs text-gray-500">
        Setting saat ini tersimpan di MongoDB{epsKm > 0 ? ` (eps ${epsKm} km, MinPts ${minPts})` : ''}.
      </p>
    {/if}

    <button
      onclick={handleSaveClustering}
      disabled={saving}
      class="w-full border-2 border-border rounded-base bg-yellow-300 px-4 py-2 font-heading text-lg shadow-shadow hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? 'Menyimpan...' : 'Simpan Parameter Clustering'}
    </button>
  </div>

  <!-- ═══ Card 2: Retrain Model ═══ -->
  <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6 space-y-4">
    <h2 class="text-xl font-heading">Training Ulang Model → ONNX</h2>
    <p class="text-sm text-gray-600">
      Gambar dataset di-upload ke <b>ImageKit</b> (via Asset Service), lalu
      service mengunduhnya, memisah train/val, menjalankan training
      (EfficientNet-B0), dan mengekspor <code>model.onnx</code> baru.
    </p>

    <div class="flex flex-wrap gap-3 items-end">
      <div>
        <label for="label" class="block text-sm font-medium mb-1">Label kategori</label>
        <input
          id="label"
          list="label-options"
          bind:value={label}
          class="w-48 border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        <datalist id="label-options">
          {#each LABELS as l}
            <option value={l} />
          {/each}
        </datalist>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Gambar dataset</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onchange={(e) => {
            files = Array.from(e.currentTarget.files ?? []);
          }}
          class="block w-full text-sm text-gray-600 file:mr-3 file:border-2 file:border-border file:rounded-base file:bg-white file:px-3 file:py-1.5 file:font-heading hover:file:bg-yellow-100"
        />
      </div>
      <button
        onclick={handleUpload}
        disabled={uploading}
        class="border-2 border-border rounded-base bg-white px-4 py-2 font-heading shadow-shadow hover:bg-yellow-100 disabled:opacity-50"
      >
        {uploading ? 'Mengupload...' : '+ Upload ke ImageKit'}
      </button>
    </div>

    {#if samples.length}
      <div class="border-2 border-border rounded-base bg-yellow-50 p-3 space-y-1">
        <p class="text-sm font-medium">Sampel siap retrain ({samples.length}):</p>
        {#each samples as s, i (i)}
          <div class="flex items-center justify-between text-sm">
            <span class="truncate"><b>{s.label}</b> — {s.url}</span>
            <button onclick={() => removeSample(i)} class="text-red-600 font-bold px-2 hover:text-red-800">✕</button>
          </div>
        {/each}
      </div>
    {/if}

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="epochs" class="block text-sm font-medium mb-1">Epochs</label>
        <input id="epochs" type="number" min="1" bind:value={epochs}
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" />
      </div>
      <div>
        <label for="batch" class="block text-sm font-medium mb-1">Batch size</label>
        <input id="batch" type="number" min="1" bind:value={batchSize}
          class="w-full border-2 border-border rounded-base px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" />
      </div>
    </div>

    <button
      onclick={handleRetrain}
      disabled={starting || status.status === 'running'}
      class="w-full border-2 border-border rounded-base bg-yellow-300 px-4 py-2 font-heading text-lg shadow-shadow hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {status.status === 'running' ? 'Sedang training...' : 'Mulai Training Ulang'}
    </button>

    {#if retrainErr}
      <div class="border-2 border-red-500 rounded-base bg-red-100 p-3 text-sm text-red-800">{retrainErr}</div>
    {/if}
    {#if retrainMsg}
      <div class="border-2 border-green-500 rounded-base bg-green-100 p-3 text-sm text-green-800">{retrainMsg}</div>
    {/if}

    <!-- Status job -->
    <div class="border-2 border-border rounded-base bg-gray-50 p-4 space-y-1 text-sm">
      <p class="font-heading">Status Retrain</p>
      {#if status.status === 'idle'}
        <p class="text-gray-600">Belum ada job. Dataset terkumpul: {datasetStats.total ?? 0} gambar.</p>
      {:else if status.status === 'running'}
        <p class="text-blue-700 font-medium">🔄 Training berjalan — epochs: {status.epochs}, batch: {status.batch_size}, gambar: {status.total_images ?? 0}...</p>
      {:else if status.status === 'done'}
        <p class="text-green-700 font-medium">✅ Selesai! Akurasi terbaik: {status.accuracy != null ? `${status.accuracy}%` : '—'}</p>
      {:else if status.status === 'error'}
        <p class="text-red-700 font-medium">❌ Gagal: {status.error}</p>
      {/if}
      {#if status.started_at}
        <p class="text-xs text-gray-400">Mulai: {new Date(status.started_at * 1000).toLocaleString()}</p>
      {/if}
      {#if status.finished_at}
        <p class="text-xs text-gray-400">Selesai: {new Date(status.finished_at * 1000).toLocaleString()}</p>
      {/if}
    </div>
  </div>
</div>
