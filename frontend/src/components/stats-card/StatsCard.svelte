<script lang="ts">
  import type { StatsCardProps } from './stats-card.types';
  let { title, value, icon: Icon, color = 'blue' }: StatsCardProps = $props();
  const colors: Record<string, string> = {
    blue: 'border-l-blue-600 bg-blue-50',
    green: 'border-l-green-600 bg-green-50',
    yellow: 'border-l-yellow-500 bg-yellow-50',
    red: 'border-l-red-500 bg-red-50',
  };
</script>

<div class="neo-border bg-white neo-shadow p-4 border-l-4 {colors[color] || colors.blue}">
  <div class="flex items-center gap-3">
    {#if Icon}
      <Icon size={32} weight="duotone" color="#2563EB" />
    {/if}
    <div>
      <p class="text-2xl font-bold">{value}</p>
      <p class="text-sm text-gray-600">{title}</p>
    </div>
  </div>
</div>
