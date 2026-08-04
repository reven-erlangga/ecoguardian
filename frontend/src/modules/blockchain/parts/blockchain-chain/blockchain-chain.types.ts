import type { Block } from '../../types';

export interface BlockchainChainProps {
  blocks: Block[];
  verified?: boolean;
}
