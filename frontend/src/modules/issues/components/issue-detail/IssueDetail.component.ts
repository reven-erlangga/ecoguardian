import { client } from '@shared/utils/graphql';
import { GET_ISSUE } from '../../graphql/queries';
import { GET_HISTORY } from '@modules/blockchain/graphql/queries';
import type { Issue } from '../../types';
import type { Block } from './IssueDetail.types';

export async function fetchIssue(id: string): Promise<Issue | null> {
  const r = await client.query(GET_ISSUE, { input: { id } }).toPromise();
  if (!r.error && r.data?.issue_IssueService_GetIssue?.issue) {
    return r.data.issue_IssueService_GetIssue.issue;
  }
  return null;
}



export async function fetchBlockchainHistory(tweetId: string): Promise<Block[]> {
  const r = await client.query(GET_HISTORY, { input: { tweet_id: tweetId } }).toPromise();
  if (!r.error && r.data?.blockchain_BlockchainService_GetHistory) {
    return r.data.blockchain_BlockchainService_GetHistory.blocks ?? [];
  }
  return [];
}

export interface ResolveInput {
  issue_id: string;
  admin_id: string;
  notes: string;
  image_hash: string;
}

export async function resolveIssue(input: ResolveInput): Promise<boolean> {
  const RESOLVE_ISSUE = `mutation($input: issue__ResolveIssueRequest_Input) {
    issue_IssueService_ResolveIssue(input: $input) { success message }
  }`;
  const r = await client.mutation(RESOLVE_ISSUE, { input }).toPromise();
  if (r.error) throw r.error;
  return r.data?.issue_IssueService_ResolveIssue?.success ?? false;
}
