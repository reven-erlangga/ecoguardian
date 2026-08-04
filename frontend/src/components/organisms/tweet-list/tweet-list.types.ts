export interface Tweet {
  id: string;
  tweetId: string;
  text?: string;
  paraphrasedText: string;
  author: string;
  authorUsername: string;
  mediaUrls: string[];
  createdAt: number | { seconds: number };
  classification?: {
    label: string;
    confidence: number;
  };
  location?: {
    lat: number;
    lon: number;
    address: string;
  };
}

export interface TweetListProps {
  tweets: Tweet[];
  loading?: boolean;
  onLoadMore?: () => void;
}