<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchIssue, fetchBlockchainHistory, resolveIssue } from './IssueDetail.component';
  import { uploadImage } from '@shared/services/upload.service';
  import type { Issue } from '../../types';
  import type { Block } from './IssueDetail.types';
  import IssueMap from '@shared/components/map/IssueMap.svelte';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
  import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
  import HammerIcon from 'phosphor-svelte/lib/HammerIcon';
  import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
  import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
  import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
  import XIcon from 'phosphor-svelte/lib/XIcon';
  import SealCheck from 'phosphor-svelte/lib/SealCheckIcon';

  let { issueId }: { issueId: string } = $props();

  let issue = $state<Issue | null>(null);
  let blocks = $state<Block[]>([]);
  let loading = $state(true);
  let error = $state('');

  // Resolve form
  let resolveNotes = $state('');
  let resolveImageFile = $state<File | null>(null);
  let resolveImagePreview = $state<string>('');
  let resolving = $state(false);
  let resolveError = $state('');
  let resolveSuccess = $state(false);

  const typeIcons: Record<string, any> = {
    fallen_tree: LeafIcon, garbage: TrashIcon, vandalism: HammerIcon,
  };
  const typeLabels: Record<string, string> = {
    fallen_tree: 'Pohon Tumbang', garbage: 'Sampah', vandalism: 'Vandalisme',
  };

  let IconComponent = $derived(typeIcons[issue?.type ?? ''] || WarningCircleIcon);
  let isResolved = $derived(issue?.status === 'resolved');
  let confidencePct = $derived(issue ? Math.round(issue.confidence * 100) : 0);

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      resolveImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => resolveImagePreview = reader.result as string;
      reader.readAsDataURL(input.files[0]);
    }
  }

  async function handleResolve() {
    if (!resolveNotes.trim()) {
      resolveError = 'Catatan resolusi wajib diisi.';
      return;
    }
    resolveError = '';
    resolving = true;
    try {
      // Upload image to Asset Service first (if selected)
      let imageHash = '';
      if (resolveImageFile) {
        imageHash = await uploadImage(resolveImageFile);
      }

      const success = await resolveIssue({
        issue_id: issueId,
        admin_id: 'admin',
        notes: resolveNotes.trim(),
        image_hash: imageHash,
      });
      if (success) {
        resolveSuccess = true;
        const updated = await fetchIssue(issueId);
        if (updated) issue = updated;
      }
    } catch (e: any) {
      resolveError = e?.message || 'Gagal menyelesaikan laporan.';
    } finally {
      resolving = false;
    }
  }

  function formatTime(ts: number | { seconds: number }): string {
    const secs = typeof ts === 'object' ? ts.seconds : ts;
    return new Date(secs * 1000).toLocaleString('id-ID');
  }

  function shortHash(h: string): string {
    if (!h || h.length <= 12) return h;
    return h.substring(0, 8) + '...' + h.slice(-4);
  }

  onMount(async () => {
    try {
      const iss = await fetchIssue(issueId);
      if (!iss) { error = 'Issue tidak ditemukan.'; return; }
      issue = iss;

      // Fetch blockchain history by tweet_id
      const bc = await fetchBlockchainHistory(iss.tweet_id);
      blocks = bc;
    } catch (e: any) {
      error = e?.message || 'Gagal memuat detail issue.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <!-- Back button -->
  <a href="/issues" class="inline-flex items-center gap-1 text-sm font-bold neo-border bg-white px-4 py-2 hover:bg-gray-100">
    <ArrowLeftIcon size={16} weight="bold" />
    Kembali ke Issues
  </a>

  {#if loading}
    <div class="text-center py-16"><p class="text-gray-500 font-bold">Memuat detail...</p></div>
  {:else if error}
    <div class="neo-border bg-red-100 text-red-700 font-bold p-4">{error}</div>
  {:else if issue}
    <!-- Issue Header -->
    <div class="neo-border bg-white neo-shadow overflow-hidden">
      <div class="bg-blue-600 text-white px-6 py-4 flex items-center gap-3">
        <IconComponent size={28} weight="bold" />
        <div>
          <h1 class="text-xl font-bold">{typeLabels[issue.type] || issue.type}</h1>
          <p class="text-sm text-blue-200">{issue.location?.address || 'Lokasi tidak diketahui'}</p>
        </div>
        <span class="ml-auto text-xs font-bold px-3 py-1 neo-border"
          class:bg-green-200={isResolved} class:text-green-800={isResolved}
          class:bg-yellow-200={!isResolved} class:text-yellow-800={!isResolved}
        >
          {isResolved ? 'Selesai' : 'Menunggu'}
        </span>
      </div>

      <div class="p-6 space-y-6">
        <!-- Paraphrased text -->
        <div>
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Deskripsi Laporan</h2>
          <p class="mt-1 text-lg">{issue.paraphrased_text}</p>
        </div>

        <!-- Map -->
        {#if issue.location?.lat && issue.location?.lon}
          <div>
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Lokasi Peta</h3>
            <IssueMap
              lat={issue.location.lat}
              lon={issue.location.lon}
              address={issue.location.address}
              height="280px"
            />
          </div>
        {:else if issue.location?.address}
          <div class="neo-border bg-gray-50 p-4">
            <h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Lokasi</h3>
            <p class="text-sm font-bold">{issue.location.address}</p>
            <p class="text-xs text-gray-400 mt-1">Koordinat tidak tersedia untuk alamat ini</p>
          </div>
        {/if}

        <!-- Detail Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="neo-border bg-gray-50 p-4">
            <h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Koordinat</h3>
            {#if issue.location?.lat}
              <p class="text-sm font-mono">
                {issue.location.lat.toFixed(6)}, {issue.location.lon.toFixed(6)}
              </p>
              <p class="text-xs text-gray-400 mt-1">{issue.location.address}</p>
            {:else}
              <p class="text-sm text-gray-400">—</p>
            {/if}
          </div>
          <div class="neo-border bg-gray-50 p-4">
            <h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Klasifikasi</h3>
            <p class="text-sm">
              <span class="font-bold">{typeLabels[issue.type] || issue.type}</span>
              <span class="text-gray-500"> — {confidencePct}%</span>
            </p>
            {#if issue.image_hash}
              <p class="text-xs text-gray-400 font-mono mt-1">Hash: {shortHash(issue.image_hash)}</p>
            {/if}
          </div>
        </div>

        <!-- Blockchain Timeline -->
        <div>
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-3">
            <CubeIcon size={18} weight="bold" />
            Blockchain Timeline
          </h3>
          {#if blocks.length === 0}
            <div class="neo-border bg-gray-50 p-4 text-center">
              <CubeIcon size={32} weight="thin" color="#9CA3AF" />
              <p class="text-sm text-gray-400 mt-2">Belum ada record blockchain untuk issue ini.</p>
              <p class="text-xs text-gray-300 mt-1">Record akan muncul setelah klasifikasi dan resolusi dicatat.</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each blocks as block}
                <div class="neo-border bg-white p-4 flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full bg-blue-100 neo-border flex items-center justify-center flex-shrink-0">
                      <SealCheckIcon size={16} weight="bold" color="#2563EB" />
                    </div>
                    {#if block.index > 0}
                      <div class="w-0.5 h-full bg-blue-200 mt-1"></div>
                    {/if}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-sm">Blok #{block.index}</span>
                      <span class="text-xs text-gray-400">{formatTime(block.timestamp)}</span>
                    </div>
                    <p class="text-sm mt-1">
                      {#if block.data.type === 'classification'}
                        Klasifikasi: <span class="font-bold">{typeLabels[block.data.label] || block.data.label}</span>
                        ({Math.round(block.data.confidence * 100)}%)
                      {:else if block.data.type === 'resolution'}
                        Resolusi oleh <span class="font-bold">{block.data.resolution?.admin_id || 'admin'}</span>
                      {:else}
                        {block.data.type}
                      {/if}
                    </p>
                    {#if block.data.type === 'resolution' && block.data.resolution}
                      <p class="text-xs text-gray-500 mt-0.5">{block.data.resolution.notes}</p>
                    {/if}
                    <p class="text-xs text-gray-400 font-mono mt-1 truncate" title={block.hash}>
                      Hash: {shortHash(block.hash)}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Resolve Section -->
        {#if !isResolved}
          <div class="neo-border border-2 border-green-400 bg-green-50 p-6">
            <h3 class="font-bold flex items-center gap-2 mb-4">
              <CheckCircleIcon size={20} weight="bold" color="#16A34A" />
              Selesaikan Laporan
            </h3>

            {#if resolveSuccess}
              <div class="neo-border bg-green-200 text-green-800 font-bold p-4 flex items-center gap-2">
                <CheckCircleIcon size={20} weight="bold" />
                Laporan berhasil diselesaikan!
              </div>
            {:else}
              <div class="space-y-4">
                <div>
                  <label for="resolve-notes" class="block text-sm font-bold mb-1">Catatan Resolusi</label>
                  <textarea id="resolve-notes" bind:value={resolveNotes} rows="3"
                    class="w-full neo-border p-3 text-sm resize-none focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-shadow"
                    placeholder="Jelaskan tindakan yang diambil..."></textarea>
                </div>

                <div>
                  <label class="block text-sm font-bold mb-1">Upload Bukti Gambar</label>
                  <div class="flex items-center gap-4">
                    <label class="neo-border bg-white px-4 py-2 text-sm font-bold cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                      <ImageIcon size={18} weight="bold" />
                      Pilih Gambar
                      <input type="file" accept="image/*" onchange={handleFileSelect} class="hidden" />
                    </label>
                    {#if resolveImagePreview}
                      <span class="text-xs text-gray-500">✓ {resolveImageFile?.name}</span>
                    {/if}
                  </div>
                  {#if resolveImagePreview}
                    <div class="mt-2 relative inline-block">
                      <img src={resolveImagePreview} alt="Preview" class="max-h-32 rounded neo-border" />
                      <button onclick={() => { resolveImageFile = null; resolveImagePreview = ''; }}
                        class="absolute -top-2 -right-2 w-5 h-5 neo-border bg-red-500 text-white flex items-center justify-center text-xs">
                        <XIcon size={12} weight="bold" />
                      </button>
                    </div>
                  {/if}
                </div>

                {#if resolveError}
                  <div class="neo-border bg-red-100 text-red-700 text-sm font-bold px-3 py-2">{resolveError}</div>
                {/if}

                <button onclick={handleResolve} disabled={resolving}
                  class="neo-border bg-green-600 text-white px-6 py-3 font-bold flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50">
                  {#if resolving}
                    <span class="animate-spin">◌</span>
                  {:else}
                    <CheckCircleIcon size={20} weight="bold" />
                  {/if}
                  {resolving ? 'Menyelesaikan...' : 'Selesaikan Laporan'}
                </button>
              </div>
            {/if}
          </div>
        {:else if issue.resolution}
          <!-- Show resolution details if resolved -->
          <div class="neo-border bg-green-50 p-6">
            <h3 class="font-bold flex items-center gap-2 mb-3">
              <CheckCircleIcon size={20} weight="bold" color="#16A34A" />
              Detail Resolusi
            </h3>
            <div class="space-y-2">
              <p class="text-sm"><span class="font-bold">Catatan:</span> {issue.resolution.notes}</p>
              <p class="text-sm"><span class="font-bold">Oleh:</span> {issue.resolution.admin_id}</p>
              <p class="text-sm"><span class="font-bold">Waktu:</span> {formatTime(issue.resolution.resolved_at)}</p>
              {#if issue.resolution.image_hash}
                <p class="text-sm"><span class="font-bold">Bukti:</span>
                  <span class="font-mono text-xs">{issue.resolution.image_hash}</span>
                </p>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
