<script lang="ts">
  import type { InputProps } from './input.types';
  import { useInput } from './input.component';

  let {
    value,
    placeholder,
    type = 'text',
    error,
    class: className,
    oninput,
    ...rest
  }: InputProps = $props();

  const { classes } = useInput({
    value,
    placeholder,
    type,
    error,
    class: className,
    oninput,
  });
</script>

<input {type} {placeholder} {value} {oninput} class={classes} {...rest} />
