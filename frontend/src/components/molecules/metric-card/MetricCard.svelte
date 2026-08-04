<script lang="ts">
  // ponytail: MetricCard molecule — angka/metrik dengan icon + warna
  import type { MetricCardProps } from './metric-card.types';
  import { metricColors } from './metric-card.component';

  let { title, value, icon: Icon, color = 'blue', class: className = '' }: MetricCardProps = $props();
</script>

<div class="border-2 border-border rounded-base bg-secondary-background shadow-shadow p-4 border-l-4 {metricColors[color] || metricColors.blue} {className}">
  <div class="flex items-center gap-3">
    {#if Icon}
      <svelte:component this={Icon} size={32} weight="duotone" color="#2563EB" />
    {/if}
    <div>
      <p class="text-2xl font-heading">{value}</p>
      <p class="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
</div>
