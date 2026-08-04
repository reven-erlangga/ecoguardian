export interface Tweet {
  id: string;
  tweetId: string;
  text?: string;
  paraphrasedText: string;
  author: string;
  authorUsername: string;
  mediaUrls: string[];
  createdAt: { seconds: number };
  classification?: {
    text: { label: string; confidence: number };
    image: { label: string; confidence: number };
  };
  location?: {
    lat: number;
    lon: number;
    address: string;
  };
}

export interface QueryTweetsParams {
  keyword?: string;
  author?: string;
  classificationLabel?: string;
  page?: number;
  perPage?: number;
}