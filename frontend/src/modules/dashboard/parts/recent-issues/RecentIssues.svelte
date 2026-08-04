<script lang="ts">
  import { dashboardStore } from '../../stores/dashboard.stores';
  import {
    containerClass, titleClass, emptyClass, cardClass, headerClass,
    typeClass, dateClass, addressClass, badgeClass,
    STATUS_OPEN_BG, STATUS_RESOLVED_BG,
  } from './recent-issues.components';

  const recent = $derived(dashboardStore.state.data.stats.recentIssues);
</script>

<div class={containerClass}>
  <h3 class={titleClass}>Issue Terbaru</h3>
  {#if recent.length === 0}
    <p class={emptyClass}>Belum ada issue.</p>
  {:else}
    {#each recent as issue}
      <div class={cardClass}>
        <div class={headerClass}>
          <span class={typeClass}>{issue.type}</span>
          <span class="{badgeClass} {issue.status === 'resolved' ? STATUS_RESOLVED_BG : STATUS_OPEN_BG}">{issue.status}</span>
        </div>
        <p class={addressClass}>{issue.address || '-'}</p>
        <span class={dateClass}>
          {new Date(issue.createdAt * 1000).toLocaleDateString('id-ID')}
        </span>
      </div>
    {/each}
  {/if}
</div>