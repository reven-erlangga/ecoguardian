export interface Tweet {
  id: string;
  text: string;
  author: string;
  imageUrl?: string;
  createdAt: string;
  label?: string;
}

export interface TweetListProps {
  tweets: Tweet[];
  loading?: boolean;
  onLoadMore?: () => void;
}
