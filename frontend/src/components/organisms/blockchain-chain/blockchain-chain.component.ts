import type { BlockchainChainProps } from './blockchain-chain.types';

export function useBlockchainChain(p: BlockchainChainProps) {
  return {
    blocks: p.blocks,
    verified: p.verified ?? true,
  };
}

export function truncateHash(hash: string, len = 12): string {
  if (hash.length <= len) return hash;
  return `${hash.slice(0, len)}...`;
}
