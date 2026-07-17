<script lang="ts">
  import type { LabelProps } from './label.types';
  import { useLabel } from './label.component';

  let { for: forAttr, text, ...rest }: LabelProps = $props();

  const { classes } = useLabel({ for: forAttr, text });
</script>

<label for={forAttr} class={classes} {...rest}>{text}</label>
