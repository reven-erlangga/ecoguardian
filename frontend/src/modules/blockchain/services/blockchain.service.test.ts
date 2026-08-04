import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils/graphql', () => ({
  client: { query: vi.fn() },
}));

import { client } from '@shared/utils/graphql';
import { fetchBlockchainHistory, verifyChain } from './blockchain.service';

describe('blockchain.service', () => {
  const mockQuery = client.query as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBlockchainHistory', () => {
    it('returns blocks on success', async () => {
      mockQuery.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: {
              blockchain_BlockchainService_GetHistory: {
                blocks: [{ index: 0, hash: 'abc' }],
              },
            },
          }),
      });
      const r = await fetchBlockchainHistory();
      expect(r).toHaveLength(1);
      expect(r[0].hash).toBe('abc');
    });

    it('returns empty array when no data', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ error: null, data: null }),
      });
      const r = await fetchBlockchainHistory();
      expect(r).toEqual([]);
    });
  });

  describe('verifyChain', () => {
    it('returns verify result on success', async () => {
      mockQuery.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: { blockchain_BlockchainService_VerifyChain: { valid: true, blocks_count: 5 } },
          }),
      });
      const r = await verifyChain();
      expect(r.valid).toBe(true);
      expect(r.blocks_count).toBe(5);
    });

    it('returns null when no data', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ error: null, data: null }),
      });
      const r = await verifyChain();
      expect(r).toBeNull();
    });
  });
});