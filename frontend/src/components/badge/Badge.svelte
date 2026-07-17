<script lang="ts">
  import type { BadgeProps } from './badge.types';
  import { useBadge } from './badge.component';

  let { variant = 'default', label, ...rest }: BadgeProps = $props();

  const { classes } = useBadge({ variant, label });
</script>

<span class={classes} {...rest}>{label}</span>
