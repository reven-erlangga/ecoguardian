export interface Block {
  index: number;
  hash: string;
  previousHash: string;
  label: string;
  timestamp: string;
  data: string;
}

export interface BlockchainChainProps {
  blocks: Block[];
  verified?: boolean;
}
