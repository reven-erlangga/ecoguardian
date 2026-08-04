<script lang="ts">
  // ponytail: Svelte Progress — class CSS persis sama dengan neobrutalism ui/progress.tsx
  import { progressRoot, progressIndicator } from './progress.component';

  let { value = 0, className = '', showLabel = false, ...rest } = $props();
</script>

<div
  class={progressRoot + ' ' + className}
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  {...rest}
>
  <div
    class={progressIndicator}
    style="transform: translateX(-{100 - value}%)"
  ></div>
</div>
{#if showLabel}
  <span class="text-xs font-base text-foreground/60 ml-2">{value}%</span>
{/if}
