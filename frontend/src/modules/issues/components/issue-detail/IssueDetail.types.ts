export interface IssueDetailProps {
  issueId: string;
}

export interface BlockData {
  type: string;
  tweet_id: string;
  label: string;
  confidence: number;
  image_hash: string;
  location?: { lat: number; lon: number; address: string };
  resolution?: { admin_id: string; notes: string; resolved_image_hash: string; resolved_at: number };
}

export interface Block {
  index: number;
  timestamp: number;
  previous_hash: string;
  hash: string;
  nonce: number;
  data: BlockData;
}
