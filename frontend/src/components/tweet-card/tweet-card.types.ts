export interface TweetCardProps {
  paraphrased_text: string;
  author_username: string;
  label: string;
  confidence?: number;
  media_urls?: string[];
  location?: string;
  created_at?: string;
}
