export const RESOLVE_ISSUE = `mutation($input: issue__ResolveIssueRequest_Input) {
  issue_IssueService_ResolveIssue(input: $input) {
    success message
  }
}`;
