export interface Issue {
  id: string;
  tweetId: string;
  type: string;
  confidence: number;
  status: 'open' | 'resolved';
  location?: { lat: number; lon: number; address: string };
  paraphrasedText: string;
  imageHashes?: string[];
  resolution?: { adminId: string; notes: string; imageHashes: string[]; resolvedAt: number };
  createdAt: number;
  resolvedAt?: number;
}

export interface Cluster {
  address: string;
  lat: number;
  lon: number;
  issueCount: number;
  types: string[];
}