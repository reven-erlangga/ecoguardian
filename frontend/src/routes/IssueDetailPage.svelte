<script lang="ts">
  import IssueDetail from '$modules/issues/parts/issue-detail/IssueDetail.svelte';
  let { issueId }: { issueId: string; navigate?: (href: string) => void } = $props();
</script>

<IssueDetail {issueId} />
