<script lang="ts">
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
  import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
  import { dashboardStore } from '../../stores/dashboard.stores';
  import {
    cardClass, titleClass, rowClass, statusBadgeClass,
    VERIFIED_BG, UNVERIFIED_BG, statClass, statLabelClass, dotClass,
  } from './blockchain-status.components';

  const stats = $derived(dashboardStore.state.data.stats);
</script>

<div class={cardClass}>
  <h3 class={titleClass}>Blockchain</h3>
  <div class={rowClass}>
    <CubeIcon size={18} weight="bold" />
    <span class={statLabelClass}>Status:</span>
    <span class="{statusBadgeClass} {stats.blockchainVerified ? VERIFIED_BG : UNVERIFIED_BG}">
      <SealCheckIcon size={14} weight="bold" />
      {stats.blockchainVerified ? 'Verified' : 'Unverified'}
    </span>
  </div>
  <div class={rowClass}>
    <span class={statClass}>{stats.blockchainBlocks}</span>
    <span class={statLabelClass}>total blocks</span>
  </div>
  <div class="flex items-center gap-2 mt-2">
    <span class="{dotClass} {stats.blockchainVerified ? 'bg-green-500' : 'bg-red-500'}"></span>
    <span class="text-xs text-muted-foreground">
      {stats.blockchainVerified ? 'Chain integrity OK' : 'Chain not verified yet'}
    </span>
  </div>
</div>