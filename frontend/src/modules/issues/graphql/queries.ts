export const LIST_ISSUES = `query($input: issue__ListIssuesRequest_Input) {
  issue_IssueService_ListIssues(input: $input) {
    issues { id tweet_id type confidence status location { lat lon address } paraphrased_text resolution { admin_id notes image_hashes resolved_at } created_at }
    pagination { total }
  }
}`;

export const LIST_CLUSTERS = `query {
  issue_IssueService_ListClusters {
    clusters { address lat lon issue_count types }
  }
}`;

export const GET_ISSUE = `query($input: issue__GetIssueRequest_Input) {
  issue_IssueService_GetIssue(input: $input) {
    issue { id tweet_id type confidence status location { lat lon address } paraphrased_text resolution { admin_id notes image_hashes resolved_at } created_at resolved_at image_hashes }
  }
}`;

// ponytail: stats query — hanya baca pagination.total (murah, gak fetch issue body)
export const ISSUE_COUNT = `query($status: String) {
  issue_IssueService_ListIssues(input: { status: $status, pagination: { page: 1, per_page: 1 } }) {
    pagination { total }
  }
}`;
