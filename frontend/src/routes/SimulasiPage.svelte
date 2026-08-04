<script lang="ts">
  import SimulasiFlow from '@modules/simulasi/components/simulasi-flow/SimulasiFlow.svelte';
  let { navigate }: { navigate: (href: string) => void } = $props();
</script>

<div class="max-w-3xl mx-auto py-8 px-4">
  <SimulasiFlow />
</div>
