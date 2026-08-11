export const LABELS = [
  { value: 'fallen_tree', label: 'Pohon Tumbang', color: 'bg-green-500' },
  { value: 'garbage', label: 'Sampah', color: 'bg-yellow-500' },
  { value: 'vandalism', label: 'Vandalisme', color: 'bg-red-500' },
  { value: 'road_damage', label: 'Jalan Rusak', color: 'bg-blue-500' },
  { value: 'flood', label: 'Banjir', color: 'bg-cyan-500' },
] as const;

export const PAGE_SIZE = 20;
export const GRAPHQL_URL = 'http://localhost:4000/graphql';
export const TWITTER_SERVICE_URL = import.meta.env.PUBLIC_TWITTER_SERVICE_URL ?? 'http://localhost:8000';
export const ISSUE_SETUP_URL = import.meta.env.PUBLIC_ISSUE_SETUP_URL ?? 'http://localhost:8087';
export const CLASSIFICATION_SETUP_URL = import.meta.env.PUBLIC_CLASSIFICATION_SETUP_URL ?? 'http://localhost:8083';
