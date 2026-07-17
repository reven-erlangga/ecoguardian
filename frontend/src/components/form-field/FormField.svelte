<script lang="ts">
  import type { FormFieldProps } from './form-field.types';
  import { useFormField } from './form-field.component';
  import Label from '../label/Label.svelte';

  let { label, error, children, ...rest }: FormFieldProps = $props();

  useFormField({ label, error, children });
</script>

<div class="space-y-2" {...rest}>
  <Label text={label} />
  {@render children?.()}
  {#if error}
    <p class="text-red-500 text-sm font-medium">{error}</p>
  {/if}
</div>
