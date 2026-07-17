<script lang="ts">
  import type { CardProps } from './card.types';
  import { useCard } from './card.component';

  let { class: className, children, title, ...rest }: CardProps = $props();

  const { classes } = useCard({ class: className, children, title });
</script>

<div class={classes} {...rest}>
  {#if title}
    <h3 class="text-lg font-bold mb-4">{title}</h3>
  {/if}
  {@render children?.()}
</div>
