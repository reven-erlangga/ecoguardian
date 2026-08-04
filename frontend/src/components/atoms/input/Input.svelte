<script lang="ts">
  // ponytail: Svelte Input — class CSS persis sama dengan neobrutalism ui/input.tsx
  import type { InputProps } from './input.types';
  import { inputClasses } from './input.component';

  let {
    value = $bindable(''),
    placeholder = '',
    type = 'text',
    error = '',
    class: className = '',
    ...rest
  }: InputProps = $props();
</script>

<input
  {type}
  {placeholder}
  bind:value
  class={inputClasses({ error, className })}
  {...rest}
/>
