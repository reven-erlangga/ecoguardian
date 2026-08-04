<script lang="ts">
  import type { ResolvedCardProps } from './resolved-card.types';
  import {
    cardClass, labelClass, countClass,
    skeletonClass, skeletonLineClass, skeletonCountClass,
  } from './resolved-card.components';

  let { count = 0, loading = false }: ResolvedCardProps = $props();
</script>

<div class={cardClass}>
  {#if loading}
    <div class={skeletonClass}>
      <div class={skeletonLineClass}></div>
      <div class={skeletonCountClass}></div>
    </div>
  {:else}
    <p class={labelClass}>Resolved</p>
    <p class={countClass}>{count}</p>
  {/if}
</div>
