<script lang="ts">
  import type { BlockchainChainProps } from './blockchain-chain.types';
  import { truncateHash } from './blockchain-chain.components';

  // ponytail: props display-only — nilai gak berubah selama lifecycle
  let { blocks, verified = true }: BlockchainChainProps = $props();
  const isVerified = verified;
</script>

<div class="flex flex-col items-center gap-0">
  {#each blocks as block, i (block.hash)}
    <div
      class="w-72 p-4 bg-secondary-background border-2 border-border rounded-base flex flex-col gap-1 {isVerified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}"
    >
      <div class="flex justify-between items-center">
        <span class="text-xs font-heading text-gray-500">#{block.index}</span>
        <span class="text-xs text-gray-400">{block.timestamp}</span>
      </div>
      <span class="text-sm font-heading">{block.data?.label || block.data?.type || '-'}</span>
      <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
        {truncateHash(block.hash)}
      </code>
    </div>

    {#if i < blocks.length - 1}
      <div class="flex flex-col items-center text-gray-400 text-lg neo-mono">
        <span>⬇</span>
      </div>
    {/if}
  {/each}
</div>
