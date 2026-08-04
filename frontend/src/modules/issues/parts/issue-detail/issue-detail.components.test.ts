import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils/graphql', () => ({
  client: { query: vi.fn(), mutation: vi.fn() },
}));

import { client } from '@shared/utils/graphql';
import { fetchIssue, fetchTweetByTweetId, fetchBlockchainHistory, resolveIssue } from './issue-detail.components';

describe('issue-detail.component', () => {
  const mockQuery = client.query as any;
  const mockMutation = client.mutation as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchIssue', () => {
    it('returns issue on success', async () => {
      mockQuery.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: { issue_IssueService_GetIssue: { issue: { id: '1', type: 'fallen_tree' } } },
          }),
      });
      const r = await fetchIssue('1');
      expect(r?.id).toBe('1');
    });

    it('returns null when not found', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ error: null, data: null }),
      });
      const r = await fetchIssue('xxx');
      expect(r).toBeNull();
    });
  });

  describe('fetchTweetByTweetId', () => {
    it('returns first tweet on success', async () => {
      mockMutation.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: {
              twitter_TwitterService_QueryTweets: {
                tweets: [{ id: 't1', tweet_id: 'abc' }],
              },
            },
          }),
      });
      const r = await fetchTweetByTweetId('abc');
            expect(r?.tweetId).toBe('abc');
    });

    it('returns null when no tweets', async () => {
      mockMutation.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: { twitter_TwitterService_QueryTweets: { tweets: [] } },
          }),
      });
      const r = await fetchTweetByTweetId('xxx');
      expect(r).toBeNull();
    });
  });

  describe('fetchBlockchainHistory', () => {
    it('returns blocks', async () => {
      mockQuery.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            error: null,
            data: {
              blockchain_BlockchainService_GetHistory: {
                blocks: [{ index: 0, hash: 'h1' }],
              },
            },
          }),
      });
      const r = await fetchBlockchainHistory('tweet-1');
      expect(r).toHaveLength(1);
    });

    it('returns empty array when no data', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ error: null, data: null }),
      });
      const r = await fetchBlockchainHistory('xxx');
      expect(r).toEqual([]);
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
      const r = await resolveIssue({
        issue_id: '1',
        admin_id: 'admin',
        notes: 'fixed',
        image_hashes: [],
      });
      expect(r).toBe(true);
    });

    it('throws on error', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({ error: { message: 'fail' } }),
      });
      await expect(
        resolveIssue({ issue_id: '1', admin_id: 'a', notes: '', image_hashes: [] }),
      ).rejects.toBeDefined();
    });
  });
});