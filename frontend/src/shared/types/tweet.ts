export interface Tweet {
  id: string;
  tweet_id: string;
  text?: string;
  paraphrased_text: string;
  author: string;
  author_username: string;
  media_urls: string[];
  created_at: { seconds: number };
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
  classification_label?: string;
  page?: number;
  per_page?: number;
}
