<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchWordCloud } from './WordCloud.component';
  import type { WordCloudItem } from './WordCloud.component';

  let items = $state<WordCloudItem[]>([]);
  let loading = $state(true);

  const maxCount = $derived(items.length ? Math.max(...items.map(i => i.count)) : 1);
  const typeColors: Record<string, string> = {
    fallen_tree: '#16A34A',
    garbage: '#CA8A04',
    vandalism: '#DC2626',
  };

  function getFontSize(count: number): number {
    const ratio = count / maxCount;
    return 12 + ratio * 28; // 12px (smallest) to 40px (largest)
  }

  function getColor(word: string | null): string {
    if (!word) return '#9CA3AF';
    const w = word.toLowerCase();
    return typeColors[w] || '#2563EB';
  }

  onMount(async () => {
    try {
      items = await fetchWordCloud();
    } catch (e) {
      console.error('Failed to fetch word cloud', e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="neo-border bg-white neo-shadow p-6">
  <h3 class="text-lg font-bold mb-4">Word Cloud — Issue Trending</h3>

  {#if loading}
    <p class="text-sm text-gray-400">Memuat...</p>
  {:else if items.length === 0}
    <p class="text-sm text-gray-400">Belum ada data.</p>
  {:else}
    <div class="flex flex-wrap items-center justify-center gap-3 min-h-[200px]">
      {#each items as item (item.word + item.count)}
        <span
          class="inline-block font-bold transition-all hover:scale-110 cursor-default"
          style="font-size: {getFontSize(item.count)}px; color: {getColor(item.word)}; opacity: {0.3 + 0.7 * (item.count / maxCount)}"
          title="{item.word || 'unknown'}: {item.count} laporan"
        >
          {item.word || 'unknown'}
        </span>
      {/each}
    </div>

    <div class="mt-4 pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-400">Ukuran kata = frekuensi laporan. Warna: merah = vandalism, hijau = fallen_tree, kuning = garbage, biru = lokasi/lainnya.</p>
    </div>
  {/if}
</div>
