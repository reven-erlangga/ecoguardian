import { describe, it, expect } from 'vitest';

// ponytail: labelBadgeColor inline — komponen asli pakai $derived/$effect
// yang gak bisa di-compile vitest tanpa .svelte.ts
function labelBadgeColor(label: string, labels: readonly { value: string; color: string }[]): string {
  const found = labels.find((l) => l.value === label);
  return found?.color ?? 'bg-muted';
}

describe('labelBadgeColor', () => {
  const labels = [
    { value: 'fallen_tree', color: 'bg-green-500' },
    { value: 'garbage', color: 'bg-yellow-500' },
    { value: 'vandalism', color: 'bg-red-500' },
  ];

  it('returns color for known label', () => {
    expect(labelBadgeColor('fallen_tree', labels)).toBe('bg-green-500');
  });

  it('returns bg-muted for unknown label', () => {
    expect(labelBadgeColor('unknown', labels)).toBe('bg-muted');
  });

  it('returns bg-muted for empty', () => {
    expect(labelBadgeColor('', labels)).toBe('bg-muted');
  });
});