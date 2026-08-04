<script lang="ts">
  import { onMount } from 'svelte';
  import { blockchainStore } from '../../stores/blockchain.stores';
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
  import LinkIcon from 'phosphor-svelte/lib/LinkIcon';
  import {
    pageClass, headerClass, blockCountClass,
    emptyClass, chainLineClass, chainDotClass, blockCardClass,
    formatTimestamp, shortHash, typeLabel, typeColor,
  } from './blockchain-page.components';

  let rawBlocks = $state<any[]>([]);
  let loading = $state(true);

  const blocks = $derived([...rawBlocks].reverse());

  onMount(async () => {
    loading = true;
    await blockchainStore.actions.fetchHistory();
    rawBlocks = blockchainStore.state.data.blocks;
    loading = false;
  });
</script>

<div class={pageClass}>
  <div class={headerClass}>
    <div>
      <h1 class="text-3xl font-heading">Blockchain</h1>
      <p class="text-muted-foreground">
        Setiap klasifikasi dan penyelesaian laporan dicatat secara immutable.
      </p>
    </div>
    {#if rawBlocks.length > 0}
      <div class={blockCountClass}>
        <CubeIcon size={18} />
        <span>{rawBlocks.length} blok</span>
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="space-y-6">
      {#each Array(3) as _}
        <div class="border-2 border-border rounded-base bg-gray-100 animate-pulse h-28"></div>
      {/each}
    </div>
  {:else if rawBlocks.length === 0}
    <div class={emptyClass}>
      <CubeIcon size={64} weight="thin" color="#9CA3AF" />
      <h3 class="text-xl font-heading mt-4 mb-2">Belum Ada Blok</h3>
      <p class="text-muted-foreground max-w-md">Issue yang diklasifikasi atau diselesaikan akan tercatat di sini secara immutable.</p>
    </div>
  {:else}
    <div class="space-y-0">
      {#each blocks as block, i}
        <div class="relative flex gap-4">
          <!-- chain line -->
          <div class={chainLineClass}>
            <div class={chainDotClass}>#{block.index}</div>
            {#if i < blocks.length - 1}
              <div class="w-0.5 flex-1 bg-border mt-1"></div>
            {/if}
          </div>

          <!-- block card -->
          <div class="{blockCardClass} {typeColor(block.data?.type)}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-heading">{typeLabel(block.data?.type)}</span>
                  {#if block.data?.type === 'resolution'}
                    <span class="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded font-heading">resolved</span>
                  {:else}
                    <span class="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-heading">classified</span>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground">{formatTimestamp(block.timestamp)}</p>
              </div>
            </div>

            <div class="mt-3 space-y-1.5 text-sm">
              <div class="flex items-center gap-2">
                <span class="font-heading text-xs text-muted-foreground w-16">Tweet</span>
                <code class="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{block.data?.tweetId || '-'}</code>
              </div>

              {#if block.data?.type === 'resolution' && block.data?.resolution}
                <div class="flex items-start gap-2">
                  <span class="font-heading text-xs text-muted-foreground w-16 flex-shrink-0">Catatan</span>
                  <p class="text-xs">{block.data.resolution.notes || '-'}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-heading text-xs text-muted-foreground w-16">Admin</span>
                  <p class="text-xs">{block.data.resolution.adminId || '-'}</p>
                </div>
              {:else if block.data?.type === 'classification'}
                <div class="flex items-center gap-2">
                  <span class="font-heading text-xs text-muted-foreground w-16">Label</span>
                  <p class="text-xs">{block.data?.label || '-'}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-heading text-xs text-muted-foreground w-16">Confidence</span>
                  <p class="text-xs">{block.data?.confidence ? `${(block.data.confidence * 100).toFixed(1)}%` : '-'}</p>
                </div>
              {/if}
            </div>

            <div class="mt-3 pt-2 border-t border-border space-y-1">
              <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <LinkIcon size={12} />
                <span class="truncate max-w-[300px]" title={block.hash}>Hash: {shortHash(block.hash)}</span>
              </div>
              {#if block.previousHash && block.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000'}
                              <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                <span class="ml-4">{"←"}</span>
                                <span class="truncate max-w-[280px]" title={block.previousHash}>Prev: {shortHash(block.previousHash)}</span>
                              </div>
                            {:else if block.index === 0 || !block.previousHash}
                <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span class="ml-4">{"←"}</span>
                  <span>Genesis block</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
