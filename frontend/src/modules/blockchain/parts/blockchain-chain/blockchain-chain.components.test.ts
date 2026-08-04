import { describe, it, expect } from 'vitest';
import { truncateHash } from './blockchain-chain.components';

describe('blockchain-chain.component', () => {
  describe('truncateHash', () => {
    it('returns full hash if shorter than default len', () => {
      expect(truncateHash('abc')).toBe('abc');
      expect(truncateHash('123456789012')).toBe('123456789012');
    });

    it('truncates long hash with default len 12', () => {
      const hash = 'abcdefghijklmnopqrstuvwxyz';
      const result = truncateHash(hash);
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(hash.length);
      expect(result.startsWith('abcdefghijkl')).toBe(true);
    });

    it('respects custom len', () => {
      const hash = 'abcdefghijklmnop';
      const result = truncateHash(hash, 4);
      expect(result).toBe('abcd...');
    });
  });
});