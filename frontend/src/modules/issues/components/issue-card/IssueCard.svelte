<script lang="ts">
  import type { Issue } from '../../types';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
  import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
  import HammerIcon from 'phosphor-svelte/lib/HammerIcon';
  import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

  let { issue }: { issue: Issue } = $props();

  const typeIcons: Record<string, any> = {
    fallen_tree: LeafIcon,
    garbage: TrashIcon,
    vandalism: HammerIcon,
  };

  const typeLabels: Record<string, string> = {
    fallen_tree: 'Pohon Tumbang',
    garbage: 'Sampah',
    vandalism: 'Vandalisme',
  };

  const IconComponent = $derived(typeIcons[issue.type] || WarningCircleIcon);
  const typeLabel = $derived(typeLabels[issue.type] || issue.type);
  const isResolved = $derived(issue.status === 'resolved');
  const confidencePct = $derived(Math.round(issue.confidence * 100));
</script>

<a
  href="/issues/{issue.id}"
  class="neo-border bg-white p-4 flex flex-col gap-3 transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] block"
  class:opacity-60={isResolved}
>
  <div class="flex items-start justify-between">
    <div class="flex items-center gap-2">
      <span
        class="w-10 h-10 rounded-full flex items-center justify-center neo-border"
        class:bg-red-100={!isResolved}
        class:bg-green-100={isResolved}
      >
        <IconComponent size={22} weight="bold" />
      </span>
      <div>
        <h4 class="font-bold text-sm">{typeLabel}</h4>
        {#if issue.location?.address}
          <span class="text-xs text-gray-500 flex items-center gap-1">
            <MapPinIcon size={12} weight="bold" />
            {issue.location.address}
          </span>
        {/if}
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span
        class="text-xs font-bold px-3 py-1 neo-border"
        class:bg-green-200={isResolved}
        class:bg-yellow-200={!isResolved}
      >
        {isResolved ? 'Resolved' : 'Open'}
      </span>
      <CaretRightIcon size={16} weight="bold" class="text-gray-400" />
    </div>
  </div>

  <p class="text-sm text-gray-700">{issue.paraphrased_text}</p>

  <div class="flex items-center justify-between">
    <span class="text-xs font-mono bg-gray-100 neo-border px-2 py-0.5">
      {confidencePct}% confidence
    </span>
  </div>
</a>
