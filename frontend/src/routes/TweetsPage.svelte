<script lang="ts">
  import EmptyState from '@components/molecules/empty-state/EmptyState.svelte';
  import TweetFilter from '@modules/tweets/parts/tweet-filter/TweetFilter.svelte';
  let { navigate }: { navigate: (href: string) => void } = $props();
</script>

<div class="space-y-4">
  <h1 class="text-3xl font-heading">Tweets</h1>
  <TweetFilter />
  <EmptyState icon="MessageSquareText" title="Belum Ada Tweet"
    description="Tweet yang masuk akan muncul di sini setelah melalui proses klasifikasi."
    actionLabel="Lihat Dashboard" actionHref="/dashboard" />
</div>
