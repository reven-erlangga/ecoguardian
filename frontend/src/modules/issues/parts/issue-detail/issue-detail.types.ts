export interface Block {
  index: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  nonce: number;
  data: BlockData;
}

export interface BlockData {
  type: string;
  tweetId: string;
  label: string;
  confidence: number;
  imageHashes: string[];
  location?: { lat: number; lon: number; address: string };
  resolution?: { adminId: string; notes: string; resolvedImageHash: string; resolvedAt: number };
}

export interface IssueDetailProps {
  issueId: string;
}