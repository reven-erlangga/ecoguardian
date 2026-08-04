export interface PostCardProps {
  /** Teks konten */
  text: string;
  /** Nama author */
  author: string;
  /** Label klasifikasi */
  label: string;
  /** Skor confidence (0-1) */
  confidence?: number;
  /** URL media */
  mediaUrls?: string[];
  /** Lokasi */
  location?: string;
  /** Timestamp */
  createdAt?: string;
  class?: string;
}