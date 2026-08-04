<script lang="ts">
  import type { ButtonProps } from './button.types';
  import { buttonVariants } from './button.component';

  let {
    variant = 'default',
    size = 'default',
    disabled = false,
    loading = false,
    class: className = '',
    onclick,
    children,
    type = 'button',
    ...rest
  }: ButtonProps = $props();
</script>

<button
  {type}
  {onclick}
  disabled={disabled || loading}
  class={buttonVariants({ variant, size, className })}
  {...rest}
>
  {#if loading}
    <span class="animate-spin">◌</span>
  {/if}
  {@render children?.()}
</button>
