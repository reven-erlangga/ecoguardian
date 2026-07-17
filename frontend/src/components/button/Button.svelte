<script lang="ts">
  import type { ButtonProps } from './button.types';
  import { useButton } from './button.component';

  let {
    variant,
    size,
    disabled,
    loading,
    class: className,
    onclick,
    children,
    type = 'button',
    ...rest
  }: ButtonProps = $props();

  const { classes, isDisabled } = useButton({
    variant,
    size,
    disabled,
    loading,
    class: className,
    onclick,
  });
</script>

<button {type} {onclick} disabled={isDisabled} class={classes} {...rest}>
  {#if loading}
    <span class="animate-spin mr-2">◌</span>
  {/if}
  {@render children?.()}
</button>
