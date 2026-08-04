<script lang="ts">
  import type { IssueCardProps } from './issue-card.types';
  import { typeIcons, typeLabels } from './issue-card.components';
  import { navigate } from '@shared/utils/navigate';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import Progress from '@components/atoms/progress/Progress.svelte';

  let { issue }: IssueCardProps = $props();

  const IconComponent = $derived(typeIcons[issue.type] || WarningCircleIcon);
  const typeLabel = $derived(typeLabels[issue.type] || issue.type);
  const isResolved = $derived(issue.status === 'resolved');
  const confidencePct = $derived(Math.round(issue.confidence * 100));

  function go(e: Event) {
    e.preventDefault();
    navigate(`/issues/${issue.id}`);
  }
</script>

<a
  href="/issues/{issue.id}"
  onclick={go}
  class="border-2 border-border rounded-base bg-secondary-background p-4 flex flex-col gap-3 transition-all duration-100 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none block"
  class:opacity-60={isResolved}
>
  <div class="flex items-start justify-between">
    <div class="flex items-center gap-2">
      <span
        class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-border"
        class:bg-red-100={!isResolved}
        class:bg-green-100={isResolved}
      >
        <IconComponent size={22} weight="bold" />
      </span>
      <div>
        <h4 class="font-heading text-sm">{typeLabel}</h4>
        {#if issue.location?.address}
          <span class="text-xs text-muted-foreground flex items-center gap-1">
            <MapPinIcon size={12} weight="bold" />
            {issue.location.address}
          </span>
        {/if}
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span
        class="text-xs font-heading px-3 py-1 border-2 border-border rounded-base"
        class:bg-green-200={isResolved}
        class:bg-yellow-200={!isResolved}
      >
        {isResolved ? 'Resolved' : 'Open'}
      </span>
      <CaretRightIcon size={16} weight="bold" class="text-gray-400" />
    </div>
  </div>

  <p class="text-sm text-foreground">{issue.paraphrasedText}</p>

  <div class="flex items-center justify-between">
    <Progress value={confidencePct} showLabel />
  </div>
</a>
