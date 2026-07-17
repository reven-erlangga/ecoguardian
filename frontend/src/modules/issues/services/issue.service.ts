import { client } from '@shared/utils/graphql';
import { LIST_ISSUES, LIST_CLUSTERS } from '../graphql/queries';
import { RESOLVE_ISSUE } from '../graphql/mutations';
import type { Issue, Cluster } from '../types';

export interface ListIssuesResult {
  issues: Issue[];
  total: number;
}

export async function listIssues(page = 1, perPage = 20): Promise<ListIssuesResult> {
  const r = await client
    .query(LIST_ISSUES, { input: { pagination: { page, per_page: perPage } } })
    .toPromise();

  if (r.error) throw r.error;
  const data = r.data?.issue_IssueService_ListIssues;
  return {
    issues: data?.issues ?? [],
    total: data?.pagination?.total ?? 0,
  };
}

export async function listClusters(): Promise<Cluster[]> {
  const r = await client.query(LIST_CLUSTERS, {}).toPromise();
  if (r.error) throw r.error;
  return r.data?.issue_IssueService_ListClusters?.clusters ?? [];
}

export async function resolveIssue(
  id: string,
  notes: string,
  imageHash: string,
): Promise<boolean> {
  const r = await client
    .mutation(RESOLVE_ISSUE, {
      input: { issue_id: id, admin_id: 'admin', notes, image_hash: imageHash },
    })
    .toPromise();

  if (r.error) throw r.error;
  return r.data?.issue_IssueService_ResolveIssue?.success ?? false;
}
