<script lang="ts">
  import type { BlockchainChainProps } from './blockchain-chain.types';
  import { useBlockchainChain, truncateHash } from './blockchain-chain.component';
  import { cn } from '$shared/utils/cn';

  let { blocks, verified = true }: BlockchainChainProps = $props();
  const { verified: isVerified } = useBlockchainChain({ blocks, verified });
</script>

<div class="flex flex-col items-center gap-0">
  {#each blocks as block, i (block.hash)}
    <div
      class={cn(
        'w-72 p-4 bg-white neo-border flex flex-col gap-1',
        isVerified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
      )}
    >
      <div class="flex justify-between items-center">
        <span class="text-xs font-bold text-gray-500">#{block.index}</span>
        <span class="text-xs text-gray-400">{block.timestamp}</span>
      </div>
      <span class="text-sm font-bold">{block.label}</span>
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
