import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { GET_ISSUE } from '$modules/issues/graphql/queries';
import { GET_HISTORY } from '@modules/blockchain/graphql/queries';
import type { Issue } from '@modules/issues/types';
import type { Block } from './issue-detail.types';

export async function fetchIssue(id: string): Promise<Issue | null> {
  const r = await client.query(GET_ISSUE, { input: { id } }).toPromise();
  if (!r.error && r.data?.issue_IssueService_GetIssue?.issue) {
    return camelizeKeys(r.data.issue_IssueService_GetIssue.issue);
  }
  return null;
}

export async function fetchTweetByTweetId(tweetId: string): Promise<any | null> {
  const QUERY = `mutation($input: twitter__QueryTweetsRequest_Input) {
    twitter_TwitterService_QueryTweets(input: $input) {
      tweets { id tweet_id text author author_username media_urls created_at { seconds } }
    }
  }`;
  const r = await client.mutation(QUERY, { input: { keyword: tweetId, pagination: { page: 1, per_page: 1 } } }).toPromise();
  if (!r.error && r.data?.twitter_TwitterService_QueryTweets?.tweets?.length) {
    return camelizeKeys(r.data.twitter_TwitterService_QueryTweets.tweets[0]);
  }
  return null;
}

export async function fetchBlockchainHistory(tweetId: string): Promise<Block[]> {
  const r = await client.query(GET_HISTORY, { input: { tweet_id: tweetId } }).toPromise();
  if (!r.error && r.data?.blockchain_BlockchainService_GetHistory) {
    return camelizeKeys(r.data.blockchain_BlockchainService_GetHistory.blocks ?? []);
  }
  return [];
}

export interface ResolveInput {
  issueId: string;
  adminId: string;
  notes: string;
  imageHashes: string[];
}

export async function resolveIssue(input: ResolveInput): Promise<boolean> {
  const RESOLVE_ISSUE = `mutation($input: issue__ResolveIssueRequest_Input) {
    issue_IssueService_ResolveIssue(input: $input) { success message }
  }`;
  // ponytail: backend masih snake_case untuk input
  const backendInput = {
    issue_id: input.issueId,
    admin_id: input.adminId,
    notes: input.notes,
    image_hashes: input.imageHashes,
  };
  const r = await client.mutation(RESOLVE_ISSUE, { input: backendInput }).toPromise();
  if (r.error) throw r.error;
  return r.data?.issue_IssueService_ResolveIssue?.success ?? false;
}