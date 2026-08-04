import type { Snippet } from 'svelte';

export interface PaginationProps {
  /** Halaman aktif (1-based) */
  page?: number;
  /** Total halaman */
  totalPages?: number;
  /** Total item (0 = hide pagination) */
  total?: number;
  /** Callback saat page berubah */
  onchange?: (page: number) => void;
  /** Icon atau snippet untuk tombol prev */
  prevIcon?: Snippet;
  /** Icon atau snippet untuk tombol next */
  nextIcon?: Snippet;
  /** Label untuk tombol prev (default: Prev) */
  prevLabel?: string;
  /** Label untuk tombol next (default: Next) */
  nextLabel?: string;
  class?: string;
}
