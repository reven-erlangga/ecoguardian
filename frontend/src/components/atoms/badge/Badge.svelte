<script lang="ts">
  import type { BadgeProps } from './badge.types';
  import { badgeVariants } from './badge.component';

  let {
    variant = 'default',
    children,
    class: className = '',
  }: BadgeProps = $props();

  const cx = $derived(badgeVariants({ variant }) + ' ' + className);
</script>

<span data-slot="badge" class={cx}>
  {#if children}
    {@render children()}
  {/if}
</span>
