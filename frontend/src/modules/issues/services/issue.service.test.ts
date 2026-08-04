import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils/graphql', () => ({
  client: { query: vi.fn(), mutation: vi.fn() },
}));

import { client } from '@shared/utils/graphql';
import { listIssues, listClusters, resolveIssue, fetchStats } from './issue.service';

describe('issue.service', () => {
  const mockQuery = client.query as any;
  const mockMutation = client.mutation as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listIssues', () => {
    it('returns issues and total on success', async () => {
      mockQuery.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: {
              issue_IssueService_ListIssues: {
                issues: [{ id: '1', type: 'fallen_tree' }],
                pagination: { total: 10 },
              },
            },
          }),
      });
      const r = await listIssues(1, 5);
      expect(r.issues).toHaveLength(1);
      expect(r.total).toBe(10);
    });

    it('throws on error', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ error: { message: 'fail' } }),
      });
      await expect(listIssues()).rejects.toBeDefined();
    });

    it('returns empty when no data', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ error: null, data: null }),
      });
      const r = await listIssues();
      expect(r.issues).toEqual([]);
      expect(r.total).toBe(0);
    });
  });

  describe('listClusters', () => {
    it('returns clusters', async () => {
      mockQuery.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: {
              issue_IssueService_ListClusters: {
                clusters: [{ address: 'Jakarta', lat: -6, lon: 106, issue_count: 3, types: [] }],
              },
            },
          }),
      });
      const r = await listClusters();
      expect(r).toHaveLength(1);
      expect(r[0].address).toBe('Jakarta');
    });
  });

  describe('resolveIssue', () => {
    it('returns true on success', async () => {
      mockMutation.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: { issue_IssueService_ResolveIssue: { success: true, message: 'OK' } },
          }),
      });
      const r = await resolveIssue('id-1', 'fixed', ['hash1']);
      expect(r).toBe(true);
    });

    it('returns false when success=false', async () => {
      mockMutation.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: { issue_IssueService_ResolveIssue: { success: false } },
          }),
      });
      const r = await resolveIssue('id-1', 'fixed', []);
      expect(r).toBe(false);
    });
  });

  describe('fetchStats', () => {
    it('returns resolved + open count', async () => {
      mockQuery
        .mockReturnValueOnce({
          toPromise: () => Promise.resolve({ data: { issue_IssueService_ListIssues: { pagination: { total: 7 } } } }),
        })
        .mockReturnValueOnce({
          toPromise: () => Promise.resolve({ data: { issue_IssueService_ListIssues: { pagination: { total: 3 } } } }),
        });
      const r = await fetchStats();
      expect(r.resolved).toBe(7);
      expect(r.open).toBe(3);
    });
  });
});