import { describe, it, expect } from 'vitest';
import { labelBadgeColor } from './issue-card.components';

describe('issue-card.component', () => {
  describe('labelBadgeColor', () => {
    it('returns green for deforestation', () => {
      expect(labelBadgeColor('deforestation')).toBe('bg-green-200');
    });

    it('returns blue for water_pollution', () => {
      expect(labelBadgeColor('water_pollution')).toBe('bg-blue-200');
    });

    it('returns gray for unknown', () => {
      expect(labelBadgeColor('unknown_type')).toBe('bg-gray-200');
    });

    it('returns gray for empty', () => {
      expect(labelBadgeColor('')).toBe('bg-gray-200');
    });
  });
});