<script lang="ts">
  import { onMount } from 'svelte';
  import { DEFAULT_CARDS, fetchStatsFromGateway } from './stats-grid.component';
  import StatsCard from '@components/stats-card/StatsCard.svelte';

  let cards = $state([...DEFAULT_CARDS]);

  onMount(async () => {
    const stats = await fetchStatsFromGateway();
    if (stats.tweets !== undefined) cards[0].value = stats.tweets;
    if (stats.fallenTree !== undefined) cards[1].value = stats.fallenTree;
    if (stats.garbage !== undefined) cards[2].value = stats.garbage;
    if (stats.vandalism !== undefined) cards[3].value = stats.vandalism;
    if (stats.unreadNotifs !== undefined) cards[4].value = stats.unreadNotifs;
  });
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {#each cards as card (card.title)}
    <StatsCard
      title={card.title}
      value={card.value}
      icon={card.icon}
      color={card.color}
    />
  {/each}
</div>
