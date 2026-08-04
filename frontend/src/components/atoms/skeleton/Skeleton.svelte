<script lang="ts">
  // ponytail: Svelte Skeleton — neobrutalism, pattern sama seperti Input
  import type { SkeletonProps } from './skeleton.types';
  import { skeletonBase, skeletonShape } from './skeleton.component';

  let {
    variant = 'rect',
    width = '100%',
    height = '20px',
    class: className = '',
  }: SkeletonProps = $props();

  const shape = $derived(skeletonShape[variant] || skeletonShape.rect);
</script>

<div
  class="{skeletonBase} {shape} {className}"
  style={variant === 'text' ? `height:${height};width:${width}` : `width:${width};height:${height}`}
  role="status"
  aria-label="Loading"
></div>
