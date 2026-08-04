// ponytail: CSS classes + utility functions untuk BlockchainPage

import CubeIcon from 'phosphor-svelte/lib/CubeIcon';

export const pageClass = 'space-y-6';

export const headerClass = 'flex items-center justify-between';

export const blockCountClass =
  'flex items-center gap-2 border-2 border-border rounded-base bg-secondary-background px-4 py-2 text-sm font-heading';

export const emptyClass =
  'flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-base';

export const chainLineClass = 'flex flex-col items-center w-10 flex-shrink-0';

export const chainDotClass =
  'w-8 h-8 rounded-full border-2 border-border bg-secondary-background flex items-center justify-center text-xs font-heading z-10';

export const blockCardClass =
  'flex-1 mb-6 border-2 border-border rounded-base shadow-shadow bg-secondary-background p-4 border-l-4';

export function formatTimestamp(ts: number | { seconds: number }): string {
  const secs = typeof ts === 'object' ? ts.seconds : ts;
  if (!secs) return '-';
  return new Date(secs * 1000).toLocaleString('id-ID');
}

export function shortHash(h: string): string {
  if (!h || h.length <= 12) return h || '-';
  return h.slice(0, 8) + '...' + h.slice(-4);
}

export function typeLabel(t: string): string {
  const labels: Record<string, string> = {
    classification: 'Klasifikasi',
    resolution: 'Penyelesaian',
  };
  return labels[t] || t || '-';
}

export function typeColor(t: string): string {
  return t === 'resolution' ? 'border-l-green-500 bg-green-50' : 'border-l-blue-500 bg-blue-50';
}
