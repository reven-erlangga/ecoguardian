<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchIssue, fetchBlockchainHistory, fetchTweetByTweetId, resolveIssue } from './issue-detail.components';
  import { uploadImages } from '@shared/services/upload.service';
  import { navigate } from '@shared/utils/navigate';
  import { createToast } from '$shared/stores/toast-control.stores';
  import type { Issue } from '@modules/issues/types';
  import type { Block } from './issue-detail.types';
  import Map from '@components/atoms/map/Map.svelte';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
  import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
  import HammerIcon from 'phosphor-svelte/lib/HammerIcon';
  import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
  import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
  import XIcon from 'phosphor-svelte/lib/XIcon';
  import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
  import UserIcon from 'phosphor-svelte/lib/UserIcon';
  import CalendarIcon from 'phosphor-svelte/lib/CalendarBlankIcon';
  import Progress from '@components/atoms/progress/Progress.svelte';
  import Card from '@components/atoms/card/Card.svelte';

  let { issueId }: { issueId: string } = $props();

  let issue = $state<Issue | null>(null);
  let tweet = $state<any | null>(null);
  let blocks = $state<Block[]>([]);
  let loading = $state(true);
  let error = $state('');

  // Resolve form
  let resolveNotes = $state('');
  let resolveImageFiles = $state<File[]>([]);
  let resolveImagePreviews = $state<string[]>([]);
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
  let tweetImage = $derived(tweet?.mediaUrls?.[0] ?? null);

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      resolveImageFiles = Array.from(input.files);
      const previews: string[] = [];
      let loaded = 0;
      for (const file of input.files) {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result as string);
          loaded++;
          if (loaded === input.files!.length) {
            resolveImagePreviews = previews;
          }
        };
        reader.readAsDataURL(file);
      }
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
      let imageHashes: string[] = [];
      if (resolveImageFiles.length > 0) {
        imageHashes = await uploadImages(resolveImageFiles);
      }
      const success = await resolveIssue({
              issueId: issueId,
              adminId: 'admin',
              notes: resolveNotes.trim(),
              imageHashes: imageHashes,
            });
      if (success) {
        resolveSuccess = true;
        createToast({ title: 'Laporan Diselesaikan', description: `Issue ${issueId.slice(0, 8)}... berhasil di-resolve.`, variant: 'success' });
        const updated = await fetchIssue(issueId);
        if (updated) issue = updated;
        // ponytail: refresh blockchain timeline
        const bc = await fetchBlockchainHistory(issue?.tweetId ?? '');
        blocks = bc;
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

  // ponytail: safety timeout — kalau fetch issue detail hang, stop loading after 15 detik
  let _unmounted = false;
  const SAFETY_TIMEOUT = 15_000;

  async function load() {
    if (_unmounted) return;
    try {
      const iss = await fetchIssue(issueId);
      if (_unmounted) return;
      if (!iss) { error = 'Issue tidak ditemukan.'; return; }
      issue = iss;

      const [bc, tw] = await Promise.all([
              fetchBlockchainHistory(iss.tweetId),
              fetchTweetByTweetId(iss.tweetId),
            ]);
      if (_unmounted) return;
      blocks = bc;
      tweet = tw;
    } catch (e: any) {
      if (!_unmounted) error = e?.message || 'Gagal memuat detail issue.';
    } finally {
      if (!_unmounted) loading = false;
    }
  }

  onMount(() => {
    // ponytail: safety timeout — cuma trigger kalau loading masih true setelah 15s
    const timer = setTimeout(() => {
      if (loading && !_unmounted) {
        loading = false;
        error = 'Waktu habis — coba refresh.';
      }
    }, SAFETY_TIMEOUT);

    load();
    // ponytail: re-fetch tiap SPA page load
    document.addEventListener('astro:page-load', load);
    return () => {
      _unmounted = true;
      clearTimeout(timer);
      document.removeEventListener('astro:page-load', load);
    };
  });
</script>

<div class="space-y-6">
  <a href="/issues" onclick={(e) => { e.preventDefault(); navigate('/issues'); }} class="inline-flex items-center gap-1 text-sm font-heading border-2 border-border rounded-base bg-secondary-background px-4 py-2 hover:bg-gray-100 w-fit">
    <ArrowLeftIcon size={16} weight="bold" />
    Kembali
  </a>

  {#if loading}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 space-y-6">
        <div class="border-2 border-border rounded-base shadow-shadow bg-secondary-background overflow-hidden">
          <div class="bg-gray-200 h-14 w-full"></div>
          <div class="p-6 space-y-6">
            <div class="border-2 border-border rounded-base bg-gray-100 h-64 w-full flex items-center justify-center">
              <div class="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="h-6 bg-gray-200 rounded w-full"></div>
              <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="border-2 border-border rounded-base bg-gray-50 p-4">
                <div class="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div class="border-2 border-border rounded-base bg-gray-50 p-4">
                <div class="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-4 space-y-6">
        <div class="border-2 border-border rounded-base bg-gray-100 h-48 w-full flex items-center justify-center">
          <div class="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div class="border-2 border-border rounded-base bg-secondary-background p-4">
          <div class="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div class="border-2 border-border rounded-base bg-gray-50 p-4">
          <div class="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="space-y-2">
            <div class="border-2 border-border rounded-base bg-secondary-background h-16 w-full"></div>
            <div class="border-2 border-border rounded-base bg-secondary-background h-16 w-full"></div>
          </div>
        </div>
      </div>
    </div>
  {:else if error}
    <div class="border-2 border-border rounded-base bg-destructive/20 text-destructive-foreground font-heading p-4">{error}</div>
  {:else if issue}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 space-y-6">
        <div class="border-2 border-border rounded-base shadow-shadow bg-secondary-background overflow-hidden">
          <div class="bg-main text-main-foreground px-6 py-4 flex items-center gap-3">
            <IconComponent size={28} weight="bold" />
            <div>
              <h1 class="text-xl font-heading">{typeLabels[issue.type] || issue.type}</h1>
              <p class="text-sm text-blue-200">{issue.location?.address || 'Lokasi tidak diketahui'}</p>
            </div>
            <span class="ml-auto text-xs font-heading px-3 py-1 border-2 border-border rounded-base"
              class:bg-green-200={isResolved} class:text-green-800={isResolved}
              class:bg-yellow-200={!isResolved} class:text-yellow-800={!isResolved}
            >
              {isResolved ? 'Selesai' : 'Menunggu'}
            </span>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide mb-2">Gambar Issue</h3>
              {#if tweetImage}
                <Card variant="image" imageUrl={tweetImage} caption="Gambar Issue" />
              {:else}
                <div class="border-2 border-border rounded-base bg-gray-100 p-8 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={48} weight="thin" />
                  <p class="mt-2 text-sm font-heading">Gambar tidak tersedia (404)</p>
                </div>
              {/if}
            </div>
            <div>
              <h2 class="text-sm font-heading text-muted-foreground uppercase tracking-wide">Deskripsi Laporan</h2>
              <p class="mt-1 text-lg">{issue.paraphrasedText}</p>
            </div>
            <div class="border-2 border-border rounded-base bg-gray-50 p-4">
                <h3 class="text-xs font-heading text-muted-foreground uppercase mb-2">Klasifikasi</h3>
                <div class="space-y-1">
                  <p class="text-sm font-heading">{typeLabels[issue.type] || issue.type}</p>
                  <Progress value={confidencePct} />
                </div>
                {#if issue.imageHashes?.length}
                                  <p class="text-xs text-gray-400 font-mono mt-1">Hash: {shortHash(issue.imageHashes?.[0] || '')}</p>
                                {/if}
                              </div>
                            <div class="border-2 border-border rounded-base bg-gray-50 p-4">
                              <h3 class="text-xs font-heading text-muted-foreground uppercase mb-2">Tweet ID</h3>
                              <p class="text-sm font-mono">{issue.tweetId}</p>
                              <p class="text-xs text-gray-400 mt-1">Dibuat: {formatTime(issue.createdAt)}</p>
            </div>
          </div>
        </div>
        {#if !isResolved}
          <div class="border-2 border-border rounded-base border-green-400 bg-green-50 p-6">
            <h3 class="font-heading flex items-center gap-2 mb-4">
              <CheckCircleIcon size={20} weight="bold" color="#16A34A" />
              Selesaikan Laporan
            </h3>
            {#if resolveSuccess}
              <div class="border-2 border-border rounded-base bg-green-200 text-green-800 font-heading p-4 flex items-center gap-2">
                <CheckCircleIcon size={20} weight="bold" />
                Laporan berhasil diselesaikan!
              </div>
            {:else}
              <div class="space-y-4">
                <div>
                  <label for="resolve-notes" class="block text-sm font-heading mb-1">Catatan Resolusi</label>
                  <textarea id="resolve-notes" bind:value={resolveNotes} rows="3" class="w-full border-2 border-border rounded-base p-3 text-sm resize-none focus:outline-none focus:shadow-shadow transition-shadow" placeholder="Jelaskan tindakan yang diambil..."></textarea>
                </div>
                <div>
                  <p class="block text-sm font-heading mb-1">Upload Bukti Gambar</p>
                  <div class="flex items-center gap-4">
                    <label class="border-2 border-border rounded-base bg-secondary-background px-4 py-2 text-sm font-heading cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                      <ImageIcon size={18} weight="bold" />
                      Pilih Gambar
                      <input type="file" accept="image/*" onchange={handleFileSelect} class="hidden" multiple />
                    </label>
                    {#if resolveImagePreviews.length > 0}
                      <span class="text-xs text-muted-foreground">✓ {resolveImageFiles.length} file dipilih</span>
                    {/if}
                  </div>
                  {#if resolveImagePreviews.length > 0}
                    <div class="mt-2 flex flex-wrap gap-2">
                      {#each resolveImagePreviews as preview}
                        <div class="relative inline-block">
                          <img src={preview} alt="Preview" class="h-20 w-20 object-cover rounded border-2 border-border" />
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
                {#if resolveError}
                  <div class="border-2 border-border rounded-base bg-destructive/20 text-destructive-foreground text-sm font-heading px-3 py-2">{resolveError}</div>
                {/if}
                <button onclick={handleResolve} disabled={resolving}
                  class="border-2 border-border rounded-base bg-green-600 text-white px-6 py-3 font-heading flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50">
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
          <div class="border-2 border-border rounded-base bg-green-50 p-6">
            <h3 class="font-heading flex items-center gap-2 mb-3">
              <CheckCircleIcon size={20} weight="bold" color="#16A34A" />
              Detail Resolusi
            </h3>
            <div class="space-y-2">
              <p class="text-sm"><span class="font-heading">Catatan:</span> {issue.resolution.notes}</p>
              <p class="text-sm"><span class="font-heading">Oleh:</span> {issue.resolution.adminId}</p>
                            <p class="text-sm"><span class="font-heading">Waktu:</span> {formatTime(issue.resolution.resolvedAt)}</p>
                            {#if issue.resolution.imageHashes?.length}
                              <div class="mt-3">
                                <p class="text-sm font-heading mb-2">Bukti Gambar:</p>
                                <div class="flex flex-wrap gap-4">
                                  {#each issue.resolution.imageHashes as hash, i}
                      <Card
                        variant="image"
                        imageUrl={hash.startsWith('http') ? hash : `http://localhost:8088${hash}`}
                        caption={`Bukti ${i + 1}`}
                      />
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      <div class="lg:col-span-4 space-y-6">
        {#if issue.location?.lat && issue.location?.lon}
          <div>
            <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                          <MapPinIcon size={16} weight="bold" /> Peta Lokasi
            </h3>
            <Map lat={issue.location.lat} lon={issue.location.lon} address={issue.location.address} height="220px" interactive={false} />
          </div>
        {:else}
          <div class="border-2 border-border rounded-base bg-gray-50 p-4 text-center">
            <MapPinIcon size={28} weight="thin" color="#9CA3AF" />
            <p class="text-sm text-gray-400 mt-2">Location not found</p>
          </div>
        {/if}
        {#if tweet}
          <div class="border-2 border-border rounded-base shadow-shadow bg-secondary-background p-4">
            <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
                          <UserIcon size={16} weight="bold" /> Tweet Asal
            </h3>
            <div class="space-y-2">
              <p class="text-sm font-heading">@{tweet.authorUsername || tweet.author || 'unknown'}</p>
                            <p class="text-sm text-foreground">{tweet.text}</p>
                            {#if tweet.createdAt}
                              <p class="text-xs text-gray-400 flex items-center gap-1">
                                <CalendarIcon size={12} weight="bold" />
                                {formatTime(tweet.createdAt)}
                              </p>
                            {/if}
            </div>
          </div>
        {:else}
          <div class="border-2 border-border rounded-base bg-gray-50 p-4 text-center">
            <p class="text-sm text-gray-400">Tweet tidak ditemukan</p>
          </div>
        {/if}
        <div>
          <h3 class="text-sm font-heading text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                      <CubeIcon size={18} weight="bold" />
                      Blockchain Timeline
          </h3>
          {#if blocks.length === 0}
            <div class="border-2 border-border rounded-base bg-gray-50 p-4 text-center">
              <CubeIcon size={32} weight="thin" color="#9CA3AF" />
              <p class="text-sm text-gray-400 mt-2">Belum ada record blockchain.</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each blocks as block}
                <div class="border-2 border-border rounded-base bg-secondary-background p-4 flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full bg-blue-100 border-2 border-border flex items-center justify-center flex-shrink-0">
                      <SealCheckIcon size={16} weight="bold" color="#2563EB" />
                    </div>
                    {#if block.index > 0}
                      <div class="w-0.5 h-full bg-blue-200 mt-1"></div>
                    {/if}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="font-heading text-sm">Blok #{block.index}</span>
                      <span class="text-xs text-gray-400">{formatTime(block.timestamp)}</span>
                    </div>
                    <p class="text-sm mt-1">
                      {#if block.data.type === 'classification'}
                        Klasifikasi: <span class="font-heading">{typeLabels[block.data.label] || block.data.label}</span>
                        <Progress value={Math.round(block.data.confidence * 100)} />
                      {:else if block.data.type === 'resolution'}
                        Resolusi oleh <span class="font-heading">{block.data.resolution?.adminId || 'admin'}</span>
                      {:else}
                        {block.data.type}
                      {/if}
                    </p>
                    {#if block.data.type === 'resolution' && block.data.resolution}
                      <p class="text-xs text-muted-foreground mt-0.5">{block.data.resolution.notes}</p>
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
      </div>
    </div>
  {/if}
</div>
