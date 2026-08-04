<script lang="ts">
  import { onMount } from 'svelte';
  import cloud from 'd3-cloud';
  import { scaleSqrt } from 'd3-scale';
  import { fetchWordCloud } from './word-cloud.components';
  import type { WordCloudItem } from './word-cloud.types';
  import Skeleton from '@components/atoms/skeleton/Skeleton.svelte';

  let loading = $state(true);

  const TYPE_LABELS: Record<string, string> = {
    deforestation: 'Deforestasi',
    water_pollution: 'Pencemaran Air',
    air_pollution: 'Pencemaran Udara',
    illegal_mining: 'Tambang Ilegal',
    wildlife_trafficking: 'Perdagangan Satwa',
    coral_bleaching: 'Pemutihan Karang',
    coastal_erosion: 'Erosi Pesisir',
    waste_management: 'Pengelolaan Sampah',
  };

  const CATEGORY_KEYS = new Set(Object.keys(TYPE_LABELS));

  // ponytail: stop words umum dari hasil tokenizer — skip
  const STOP_WORDS = new Set([
    'dari', 'laporan', 'baru', 'pengguna', 'area', 'lokasi',
    'yang', 'tidak', 'disebutkan',
  ]);

  const COLORS = [
    '#9F1239', '#BE123C', '#E11D48', '#F43F5E', '#FB7185',
    '#FDA4AF', '#FECDD3', '#9F1239', '#BE123C', '#E11D48',
    '#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#9F1239',
  ];

  let placedWords: any[] = $state([]);
  let vb = $state<string | null>(null);
  let cloudGroup: SVGGElement | undefined = $state();

  // ponytail: ukur bbox asli dari DOM (getBBox), lalu jadikan viewBox —
  // svg fixed 320px + preserveAspectRatio=meet => auto zoom-out biar semua fit
  $effect(() => {
    if (!cloudGroup || placedWords.length === 0) return;
    const b = cloudGroup.getBBox();
    const pad = 12;
    vb = `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`;
  });

  onMount(async () => {
    let cancelled = false;
    const load = async () => {
      try {
        const items = await fetchWordCloud();
        if (cancelled || !items.length) { loading = false; return; }

        // Filter + classify: kategori (boosted), lokasi, keyword relevan
        const categoryBoost = 3;
        let wordEntries: { text: string; count: number }[] = [];

        for (const item of items) {
          if (!item.word || STOP_WORDS.has(item.word)) continue;
          const text = TYPE_LABELS[item.word] || item.word;
          const count = CATEGORY_KEYS.has(item.word)
            ? item.count * categoryBoost
            : item.count;
          wordEntries.push({ text, count });
        }

        if (cancelled || !wordEntries.length) { loading = false; return; }

        const maxCount = Math.max(...wordEntries.map((w) => w.count), 1);
        const minCount = Math.min(...wordEntries.map((w) => w.count), 0);

        const fontSize = scaleSqrt()
          .domain([minCount, maxCount])
          .range([13, 54]);

        const wordData = wordEntries.map((w) => ({
          text: w.text,
          size: maxCount === minCount ? 28 : Math.round(fontSize(w.count)),
        }));

        cloud()
          .size([1200, 800])
          .words(wordData)
          .padding(4)
          .rotate(() => 0)
          .font('system-ui, sans-serif')
          .fontSize((d: any) => d.size)
          .on('end', (computed: any[]) => {
            if (cancelled || !computed.length) return;
            computed.sort((a: any, b: any) => b.size - a.size);
            placedWords = computed.map((w: any, i: number) => ({
              ...w,
              color: COLORS[i % COLORS.length],
            }));
          })
          .start();
      } catch (e) {
        if (!cancelled) console.error('Word cloud error:', e);
      } finally {
        if (!cancelled) loading = false;
      }
    };
    load();
    document.addEventListener('astro:page-load', load);
    return () => {
      cancelled = true;
      document.removeEventListener('astro:page-load', load);
    };
  });
</script>

<div class="border-2 border-border rounded-base shadow-shadow bg-secondary-background p-2">
  {#if loading}
    <div class="relative h-80 w-full" role="status" aria-label="Loading">
      <div class="absolute inset-0 p-4">
        <!-- scattered bars mimicking word cloud -->
        <div class="flex flex-wrap gap-2 content-center h-full">
          <Skeleton width="35%" height="28px" class="!rounded-md" />
          <Skeleton width="20%" height="18px" class="!rounded-md" />
          <Skeleton width="28%" height="22px" class="!rounded-md" />
          <Skeleton width="15%" height="14px" class="!rounded-md" />
          <Skeleton width="40%" height="32px" class="!rounded-md" />
          <Skeleton width="18%" height="16px" class="!rounded-md" />
          <Skeleton width="30%" height="20px" class="!rounded-md" />
          <Skeleton width="22%" height="24px" class="!rounded-md" />
          <Skeleton width="12%" height="14px" class="!rounded-md" />
          <Skeleton width="45%" height="26px" class="!rounded-md" />
          <Skeleton width="16%" height="18px" class="!rounded-md" />
          <Skeleton width="25%" height="20px" class="!rounded-md" />
        </div>
      </div>
    </div>
  {:else if placedWords.length === 0}
    <p class="text-sm text-gray-400">Belum ada data.</p>
  {:else}
    <div class="flex justify-center">
      <svg
        width="100%"
        height="320"
        viewBox={vb ?? "0 0 100 100"}
        preserveAspectRatio="xMidYMid meet"
        style:visibility={vb ? "visible" : "hidden"}
      >
        <g bind:this={cloudGroup}>
          {#each placedWords as w (w.text)}
            <text
              x={w.x}
              y={w.y}
              font-size={w.size}
              font-family="system-ui, sans-serif"
              font-weight="bold"
              fill={w.color}
              text-anchor="middle"
              dominant-baseline="central"
              opacity="0.9"
            >
              {w.text}
            </text>
          {/each}
        </g>
      </svg>
    </div>
  {/if}
</div>
