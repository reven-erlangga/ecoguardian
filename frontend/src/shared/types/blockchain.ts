export interface Block {
  index: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  nonce: number;
  data: BlockData;
}

export interface BlockData {
  type: 'classification' | 'resolution';
  tweetId: string;
  label: string;
  confidence: number;
  imageHash: string;
  location?: { lat: number; lon: number; address: string };
  resolution?: {
    adminId: string;
    notes: string;
    resolvedImageHash: string;
    resolvedAt: number;
  };
}

export interface VerifyResponse {
  valid: boolean;
  blocksCount: number;
  error?: string;
}