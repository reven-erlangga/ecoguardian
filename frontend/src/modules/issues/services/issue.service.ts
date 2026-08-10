import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { LIST_ISSUES, LIST_CLUSTERS, GET_ISSUE, ISSUE_COUNT } from '../graphql/queries';
import { RESOLVE_ISSUE } from '../graphql/mutations';
import type { Issue, Cluster } from '../types';

export interface ListIssuesResult {
  issues: Issue[];
  total: number;
}

export async function listIssues(page = 1, perPage = 20, status?: string, keyword?: string): Promise<ListIssuesResult> {
  const input: Record<string, unknown> = { pagination: { page, per_page: perPage } };
  if (status && status !== 'all') input.status = status;
  if (keyword) input.keyword = keyword;
  const r = await client
    .query(LIST_ISSUES, { input }, { requestPolicy: 'network-only' })
    .toPromise();

  if (r.error) throw r.error;
  const data = r.data?.issue_IssueService_ListIssues;
  return {
    issues: camelizeKeys(data?.issues ?? []),
    total: data?.pagination?.total ?? 0,
  };
}

export async function listClusters(): Promise<Cluster[]> {
  const r = await client.query(LIST_CLUSTERS, {}).toPromise();
  if (r.error) throw r.error;
  return camelizeKeys(r.data?.issue_IssueService_ListClusters?.clusters ?? []);
}

export async function getIssue(id: string): Promise<Issue | null> {
  const r = await client.query(GET_ISSUE, { input: { id } }, { requestPolicy: 'network-only' }).toPromise();
  if (r.error) throw r.error;
  const raw = r.data?.issue_IssueService_GetIssue?.issue;
  return raw ? (camelizeKeys(raw) as Issue) : null;
}

export async function resolveIssue(
  id: string,
  notes: string,
  imageHashes: string[],
): Promise<boolean> {
  const r = await client
    .mutation(RESOLVE_ISSUE, {
      input: { issue_id: id, admin_id: 'admin', notes, image_hashes: imageHashes },
    })
    .toPromise();

  if (r.error) throw r.error;
  return r.data?.issue_IssueService_ResolveIssue?.success ?? false;
}

export async function fetchStats(): Promise<{ resolved: number; open: number }> {
  const [r1, r2] = await Promise.all([
    client.query(ISSUE_COUNT, { status: 'resolved' }).toPromise(),
    client.query(ISSUE_COUNT, { status: 'open' }).toPromise(),
  ]);
  return {
    resolved: r1.data?.issue_IssueService_ListIssues?.pagination?.total ?? 0,
    open: r2.data?.issue_IssueService_ListIssues?.pagination?.total ?? 0,
  };
}