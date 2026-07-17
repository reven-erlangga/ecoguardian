import { client } from '@shared/utils/graphql';

const GET_WORD_CLOUD = `query {
  issue_IssueService_GetWordCloud {
    items { word count }
  }
}`;

export interface WordCloudItem {
  word: string;
  count: number;
}

export async function fetchWordCloud(): Promise<WordCloudItem[]> {
  const r = await client.query(GET_WORD_CLOUD, {}).toPromise();
  if (r.error) throw r.error;
  return r.data?.issue_IssueService_GetWordCloud?.items ?? [];
}
