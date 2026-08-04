import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils/graphql', () => ({
  client: { query: vi.fn() },
}));

import { client } from '@shared/utils/graphql';
import { fetchWordCloud } from './word-cloud.components';

describe('word-cloud.component', () => {
  const mockQuery = client.query as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns word cloud items on success', async () => {
    mockQuery.mockReturnValue({
      toPromise: () =>
        Promise.resolve({
          error: null,
          data: {
            issue_IssueService_GetWordCloud: {
              items: [
                { word: 'sample', count: 5 },
                { word: 'test', count: 3 },
              ],
            },
          },
        }),
    });
    const r = await fetchWordCloud();
    expect(r).toHaveLength(2);
    expect(r[0].word).toBe('sample');
    expect(r[0].count).toBe(5);
  });

  it('throws on error', async () => {
    mockQuery.mockReturnValue({
      toPromise: () => Promise.resolve({ error: { message: 'fail' } }),
    });
    await expect(fetchWordCloud()).rejects.toBeDefined();
  });

  it('returns empty array when no data', async () => {
    mockQuery.mockReturnValue({
      toPromise: () => Promise.resolve({ error: null, data: null }),
    });
    const r = await fetchWordCloud();
    expect(r).toEqual([]);
  });
});