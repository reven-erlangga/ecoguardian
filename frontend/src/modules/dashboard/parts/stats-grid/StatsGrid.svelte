<script lang="ts">
  import { dashboardStore } from '../../stores/dashboard.stores';
  import { gridClass, cardClass, labelClass, valueClass, barTrackClass, barFillClass, TYPE_COLORS, DEFAULT_COLORS } from './stats-grid.components';

  const stats = dashboardStore.state.data.stats;

  const cards = $derived([
    { label: 'Tweets', value: stats.totalTweets, color: 'bg-primary' },
    { label: 'Total Issue', value: stats.totalIssues, color: 'bg-secondary' },
    { label: 'Open', value: stats.openIssues, color: 'bg-yellow-500' },
    { label: 'Resolved', value: stats.resolvedIssues, color: 'bg-green-500' },
    { label: 'Unread', value: stats.unreadNotifications, color: 'bg-accent' },
  ]);

  const typeBreakdown = $derived.by(() => {
    const entries = Object.entries(stats.issuesByType);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([type, count], i) => ({
        type,
        count,
        color: TYPE_COLORS[type] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        pct: (count / max) * 100,
      }));
  });
</script>

<div class={gridClass}>
  {#each cards as card}
    <div class={cardClass}>
      <h3 class={labelClass}>{card.label}</h3>
      <p class={valueClass}>{card.value}</p>
      <div class={barTrackClass}>
        <div class="{barFillClass} {card.color}" style="width: {Math.min(card.value * 10, 100)}%"></div>
      </div>
    </div>
  {/each}
</div>

{#if typeBreakdown.length > 0}
  <div class="border-2 border-border shadow-shadow rounded-lg bg-card p-4">
    <h3 class="text-sm font-heading text-foreground mb-3">Issues by Type</h3>
    <div class="space-y-2">
      {#each typeBreakdown as t}
        <div class="flex items-center gap-2">
          <span class="w-32 text-xs font-base text-muted-foreground truncate">{t.type}</span>
          <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full {t.color} transition-all" style="width: {t.pct}%"></div>
          </div>
          <span class="w-8 text-xs font-heading text-foreground text-right">{t.count}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}