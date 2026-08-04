<script lang="ts">
  // ponytail: Svelte Label — class CSS persis sama dengan neobrutalism ui/label.tsx
  import type { LabelProps } from './label.types';

  let {
    for: forAttr,
    children,
    class: className = '',
    ...rest
  }: LabelProps = $props();
</script>

<label
  for={forAttr}
  class="text-sm font-heading leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 {className}"
  {...rest}
>
  {@render children?.()}
</label>
