import { describe, it, expect } from 'vitest';
import { formatTimestamp, shortHash, typeLabel, typeColor } from './blockchain-page.components';

describe('blockchain-page.components', () => {
  describe('formatTimestamp', () => {
    it('returns "-" for falsy values', () => {
      expect(formatTimestamp(0)).toBe('-');
      expect(formatTimestamp({ seconds: 0 })).toBe('-');
    });

    it('formats number timestamp', () => {
      // 2024-01-01 00:00:00 UTC = 1704067200
      const result = formatTimestamp(1704067200);
      expect(result).toMatch(/2024/);
    });

    it('formats object timestamp', () => {
      const result = formatTimestamp({ seconds: 1704067200 });
      expect(result).toMatch(/2024/);
    });
  });

  describe('shortHash', () => {
    it('returns "-" for empty', () => {
      expect(shortHash('')).toBe('-');
    });

    it('returns "-" for null/undefined', () => {
      expect(shortHash(undefined as any)).toBe('-');
      expect(shortHash(null as any)).toBe('-');
    });

    it('returns full hash if length <= 12', () => {
      expect(shortHash('abc12345')).toBe('abc12345');
    });

    it('truncates long hash', () => {
      const hash = 'abcdef1234567890abcdef1234567890';
      const result = shortHash(hash);
      expect(result.length).toBeLessThan(hash.length);
      expect(result).toContain('...');
      expect(result.startsWith('abcdef12')).toBe(true);
    });
  });

  describe('typeLabel', () => {
    it('maps classification', () => {
      expect(typeLabel('classification')).toBe('Klasifikasi');
    });

    it('maps resolution', () => {
      expect(typeLabel('resolution')).toBe('Penyelesaian');
    });

    it('returns original for unknown', () => {
      expect(typeLabel('unknown_type')).toBe('unknown_type');
    });

    it('returns "-" for empty', () => {
      expect(typeLabel('')).toBe('-');
    });
  });

  describe('typeColor', () => {
    it('returns green for resolution', () => {
      expect(typeColor('resolution')).toContain('green');
    });

    it('returns blue for classification (default)', () => {
      expect(typeColor('classification')).toContain('blue');
    });

    it('returns blue for unknown', () => {
      expect(typeColor('something_else')).toContain('blue');
    });
  });
});