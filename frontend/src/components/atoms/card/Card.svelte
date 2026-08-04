<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import type { CardProps } from './card.types';
  import { cardVariants } from './card.component';

  let {
    variant = 'default',
    title = '',
    subtitle = '',
    icon,
    action,
    children,
    footer,
    imageUrl = '',
    caption = '',
    urls = [],
    class: className = '',
  }: CardProps = $props();

  const cx = $derived(cardVariants({ variant }) + ' ' + className);

  // Gallery state
  let selectedIdx = $state<number | null>(null);
  let imgErrors = $state<Record<number, boolean>>({});
  let direction = $state(1);

  function fullUrl(u: string): string {
    return u.startsWith('http') ? u : `http://localhost:8088${u}`;
  }

  function goTo(idx: number) {
    if (idx < 0 || idx >= urls.length) return;
    direction = idx > (selectedIdx ?? 0) ? 1 : -1;
    selectedIdx = idx;
  }

  function prev() { if (selectedIdx !== null) goTo(selectedIdx - 1); }
  function next() { if (selectedIdx !== null) goTo(selectedIdx + 1); }

  function onKeydown(e: KeyboardEvent) {
    if (selectedIdx === null) return;
    if (e.key === 'Escape') { selectedIdx = null; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  }

  onMount(() => window.addEventListener('keydown', onKeydown));
  onDestroy(() => window.removeEventListener('keydown', onKeydown));
</script>

<div class={cx} data-slot="card">
  {#if variant === 'default'}
    {#if title || subtitle || icon}
      <div class="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-[data-slot=card-action]:grid-cols-[1fr_auto]">
        {#if icon}
          <div class="col-start-1 row-span-2">{@render icon()}</div>
        {/if}
        <div>
          {#if title}
            <div class="font-heading leading-none">{title}</div>
          {/if}
          {#if subtitle}
            <div class="text-sm font-base">{subtitle}</div>
          {/if}
        </div>
        {#if action}
          <div class="col-start-2 row-span-2 row-start-1 self-start justify-self-end">{@render action()}</div>
        {/if}
      </div>
    {/if}
    {#if children}
      <div class="px-6 py-6">{@render children()}</div>
    {/if}
    {#if footer}
      <div class="flex items-center px-6 pb-6">{@render footer()}</div>
    {/if}

  {:else if variant === 'image'}
    <figure class="w-full">
      <img class="w-full aspect-4/3 object-cover" src={fullUrl(imageUrl)} alt={caption} loading="lazy" />
      {#if caption}
        <figcaption class="border-t-2 border-border p-4 text-sm font-heading">{caption}</figcaption>
      {/if}
    </figure>

  {:else if variant === 'gallery'}
    {#if urls.length > 0}
      <div class="flex flex-wrap gap-2 p-2">
        {#each urls as url, i}
          <button onclick={() => goTo(i)} class="overflow-hidden rounded border-2 border-border hover:opacity-80 transition-opacity cursor-pointer p-0" aria-label="Lihat gambar {i + 1}">
            {#if imgErrors[i]}
              <div class="h-24 w-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Not found</div>
            {:else}
              <img src={fullUrl(url)} alt="Preview {i + 1}" class="h-24 w-24 object-cover" loading="lazy" onerror={() => imgErrors[i] = true} />
            {/if}
          </button>
        {/each}
      </div>

      {#if selectedIdx !== null}
        {@const idx = selectedIdx}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onclick={() => selectedIdx = null}
          onkeydown={(e) => { if (e.key === 'Escape') selectedIdx = null; }}
          role="dialog"
          tabindex="0"
          aria-modal="true"
        >
          <button onclick={() => selectedIdx = null} class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white text-2xl hover:bg-white/40" aria-label="Tutup">✕</button>

          {#if idx > 0}
            <button onclick={(e) => { e.stopPropagation(); prev(); }} class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white text-3xl hover:bg-white/40" aria-label="Sebelumnya">‹</button>
          {/if}

          {#if idx < urls.length - 1}
            <button onclick={(e) => { e.stopPropagation(); next(); }} class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white text-3xl hover:bg-white/40" aria-label="Selanjutnya">›</button>
          {/if}

          {#key idx}
            <div in:fly={{ x: 80 * direction, duration: 200 }} out:fly={{ x: -80 * direction, duration: 150 }}>
              {#if imgErrors[idx]}
                <div class="min-h-[200px] min-w-[200px] bg-gray-200 rounded border-2 border-border flex items-center justify-center text-gray-500 text-sm font-heading">Image not found</div>
              {:else}
                <img src={fullUrl(urls[idx])} alt="Preview" class="max-h-[90vh] max-w-[90vw] object-contain rounded border-2 border-border" onerror={() => imgErrors[idx] = true} />
              {/if}
            </div>
          {/key}

          <div class="absolute bottom-4 text-white/70 text-sm font-base">{idx + 1} / {urls.length}</div>
        </div>
      {/if}
    {/if}
  {/if}
</div>
