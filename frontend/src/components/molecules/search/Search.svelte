<script lang="ts">
  // ponytail: Search molecule — wrapper Input atom + icon + debounce + Enter trigger
  // Generic, bisa dipakai untuk fitur apa pun (issues, tweets, users, etc)
  // Bridge: Svelte parent pakai onsearch, Astro island via DOM custom event 'search:change'
  import { onDestroy } from 'svelte';
  import Input from '@components/atoms/input/Input.svelte';
  import SearchIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
  import { searchWrapper, searchInner, searchIcon, searchInput } from './search.component';
  import type { SearchProps } from './search.types';

  let {
    value = $bindable(''),
    placeholder = 'Cari…',
    debounceMs = 500,
    onsearch,
    class: className = '',
  }: SearchProps = $props();

  let timer: ReturnType<typeof setTimeout> | null = null;

  function commit(val: string) {
    if (timer) clearTimeout(timer);
    timer = null;
    onsearch?.(val);
    // ponytail: generic DOM event untuk cross-island (Astro page → IssueList Svelte)
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.searchQuery = val;
      document.dispatchEvent(new CustomEvent('search:change', { detail: val }));
    }
  }

  function onChange(val: string) {
    value = val;
    if (timer) clearTimeout(timer);
    if (debounceMs > 0) {
      timer = setTimeout(() => commit(val), debounceMs);
    } else {
      commit(val);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(value);
    }
  }

  function onBlur() {
    if (value) commit(value);
  }

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<div class="{searchWrapper} {className}">
  <div class={searchInner}>
    <SearchIcon class={searchIcon} />
    <Input
      type="search"
      {placeholder}
      value={value}
      oninput={(e) => onChange(e.currentTarget.value)}
      onkeydown={onKeyDown}
      onblur={onBlur}
      class={searchInput}
    />
  </div>
</div>
