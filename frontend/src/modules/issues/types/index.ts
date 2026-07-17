export interface Issue {
  id: string;
  tweet_id: string;
  type: string;
  confidence: number;
  status: 'open' | 'resolved';
  location?: { lat: number; lon: number; address: string };
  paraphrased_text: string;
  resolution?: { admin_id: string; notes: string; image_hash: string; resolved_at: number };
  created_at: number;
  resolved_at?: number;
}

export interface Cluster {
  address: string;
  lat: number;
  lon: number;
  issue_count: number;
  types: string[];
}
