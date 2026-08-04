<script lang="ts">
  // ponytail: Toast atom — render queue dari toastControl store, auto-dismiss
  import { toastControl, dismissToast } from '$shared/stores/toast-control.stores';
  import { toastContainer, toastItem, toastVariants } from './toast.component';
  import type { ToastItem } from './toast.types';
  import XIcon from 'phosphor-svelte/lib/XIcon';

  const queue = $derived(toastControl.queue);
</script>

{#if queue.length > 0}
  <div class={toastContainer}>
    {#each queue as toast (toast.id)}
      <div class="{toastItem} {toastVariants[toast.variant]}" role="alert">
        <div class="flex-1 min-w-0">
          <p class="font-heading text-sm">{toast.title}</p>
          {#if toast.description}
            <p class="text-xs mt-0.5 opacity-80">{toast.description}</p>
          {/if}
        </div>
        <button onclick={() => dismissToast(toast.id)} class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <XIcon class="size-3.5" />
        </button>
      </div>
    {/each}
  </div>
{/if}
