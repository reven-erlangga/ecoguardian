<script lang="ts">
  import { useStatsGrid } from './stats-grid.component.svelte';

  const { cards } = useStatsGrid();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
  {#each cards as card}
    <div class="neo-border neo-shadow-sm rounded-lg bg-card p-4">
      <h3 class="text-sm font-medium text-muted-foreground">{card.label}</h3>
      <p class="mt-1 text-3xl font-bold text-foreground">{card.value}</p>
      <div class="mt-2 h-1.5 w-full rounded-full bg-muted">
        <div class="h-full rounded-full {card.color}" style="width: {Math.min(card.value * 10, 100)}%"></div>
      </div>
    </div>
  {/each}
</div>
