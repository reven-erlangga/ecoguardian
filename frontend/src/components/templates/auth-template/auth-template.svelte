<script lang="ts">
  import type { AuthTemplateProps } from './auth-template.types';
  import { useAuthTemplate } from './auth-template.component';
  import Card from '$components/card/Card.svelte';
  import LeafIcon from 'phosphor-svelte/lib/LeafIcon';

  let { title, children }: AuthTemplateProps = $props();
  useAuthTemplate({ title });
</script>

<div class="min-h-screen flex items-center justify-center bg-yellow-100 p-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold neo-border inline-block px-6 py-3 bg-yellow-300 neo-shadow flex items-center gap-3">
        <LeafIcon size={32} weight="fill" color="#16A34A" />
        Ecoguard
      </h1>
    </div>
    <Card class="p-8">
      <h2 class="text-2xl font-bold mb-6">{title}</h2>
      {@render children?.()}
    </Card>
  </div>
</div>
