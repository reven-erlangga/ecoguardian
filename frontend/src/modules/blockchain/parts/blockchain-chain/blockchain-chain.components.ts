// ponytail: utility function untuk BlockchainChain

export function truncateHash(hash: string, len = 12): string {
  if (hash.length <= len) return hash;
  return `${hash.slice(0, len)}...`;
}
