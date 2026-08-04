<script lang="ts">
  // ponytail: Dropdown atom — neobrutalism, pattern sama seperti Input
  // Usage:
  //   <Dropdown items={[{label:'A',value:'a'},{label:'B',value:'b'}]} selected="a" onchange={(v) => {}} />
  import type { DropdownProps } from './dropdown.types';
  import {
    dropdownTrigger,
    dropdownContent,
    dropdownItem,
    dropdownLabel,
  } from './dropdown.component';

  let {
    items = [],
    selected = '',
    onchange,
    label = '',
    icon,
    class: className = '',
  }: DropdownProps = $props();

  let open = $state(false);

  const currentLabel = $derived.by(() => {
    const found = items.find((i) => i.value === selected);
    return found?.label || label || 'Pilih';
  });

  function select(val: string) {
    onchange?.(val);
    open = false;
  }
</script>

<div class="relative inline-block {className}">
  <button onclick={() => open = !open} class={dropdownTrigger} data-state={open ? 'open' : 'closed'}>
    {#if icon}
      {@render icon()}
    {/if}
    {currentLabel}
  </button>

  {#if open}
    <!-- overlay close -->
    <div class="fixed inset-0 z-40" onclick={() => open = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') open = false; }} tabindex="-1"></div>

    <div class={dropdownContent} role="menu">
      {#each items as item}
        <button
          role="menuitem"
          onclick={() => select(item.value)}
          class={dropdownItem}
          data-selected={item.value === selected}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
