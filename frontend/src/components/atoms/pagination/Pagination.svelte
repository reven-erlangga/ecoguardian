<script lang="ts">
  // ponytail: Pagination atom — neobrutalism, pattern sama seperti Input
  import type { PaginationProps } from './pagination.types';
  import { paginationWrapper, paginationBtn, paginationInfo } from './pagination.component';
  import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
    import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

  let {
    page = 1,
    totalPages = 1,
    total = 0,
    onchange,
    prevIcon,
    nextIcon,
    prevLabel = 'Prev',
    nextLabel = 'Next',
    class: className = '',
  }: PaginationProps = $props();

  const visible = $derived(total > 0 && totalPages > 1);
</script>

{#if visible}
  <div class="{paginationWrapper} {className}">
    <button
      onclick={() => onchange?.(page - 1)}
      disabled={page <= 1}
      class={paginationBtn}
    >
      {#if prevIcon}
        {@render prevIcon()}
      {:else}
        <CaretLeftIcon size={14} weight="bold" />
      {/if}
      {prevLabel}
    </button>

    <span class={paginationInfo}>
      {page} / {totalPages}
    </span>

    <button
      onclick={() => onchange?.(page + 1)}
      disabled={page >= totalPages}
      class={paginationBtn}
    >
      {nextLabel}
      {#if nextIcon}
        {@render nextIcon()}
      {:else}
        <CaretRightIcon size={14} weight="bold" />
      {/if}
    </button>
  </div>
{/if}
