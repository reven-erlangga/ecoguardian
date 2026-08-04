import { describe, it, expect } from 'vitest';

// ponytail: labelBadgeColor inline — sama seperti tweet-detail
function labelBadgeColor(label: string, labels: readonly { value: string; color: string }[]): string {
  const found = labels.find((l) => l.value === label);
  return found?.color ?? 'bg-muted';
}

describe('labelBadgeColor', () => {
  const labels = [
    { value: 'fallen_tree', color: 'bg-green-500' },
    { value: 'garbage', color: 'bg-yellow-500' },
  ];

  it('returns color for known label', () => {
    expect(labelBadgeColor('garbage', labels)).toBe('bg-yellow-500');
  });

  it('returns bg-muted for unknown label', () => {
    expect(labelBadgeColor('xxx', labels)).toBe('bg-muted');
  });
});