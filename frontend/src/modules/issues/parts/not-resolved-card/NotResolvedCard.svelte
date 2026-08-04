<script lang="ts">
  import type { NotResolvedCardProps } from './not-resolved-card.types';
  import {
    cardClass, labelClass, countClass,
    skeletonClass, skeletonLineClass, skeletonCountClass,
  } from './not-resolved-card.components';

  let { count = 0, loading = false }: NotResolvedCardProps = $props();
</script>

<div class={cardClass}>
  {#if loading}
    <div class={skeletonClass}>
      <div class={skeletonLineClass}></div>
      <div class={skeletonCountClass}></div>
    </div>
  {:else}
    <p class={labelClass}>Not Resolved</p>
    <p class={countClass}>{count}</p>
  {/if}
</div>
