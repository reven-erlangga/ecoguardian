import { client } from '@shared/utils/graphql';
import type { WordCloudItem } from './word-cloud.types';

const GET_WORD_CLOUD = `query {
  issue_IssueService_GetWordCloud {
    items { word count }
  }
}`;

export async function fetchWordCloud(): Promise<WordCloudItem[]> {
  const r = await client.query(GET_WORD_CLOUD, {}).toPromise();
  if (r.error) throw r.error;
  return r.data?.issue_IssueService_GetWordCloud?.items ?? [];
}
