<script lang="ts">
  import { navbarClass, navbarTitleClass } from './navbar.component';
  import type { NavbarProps } from './navbar.types';

  let {
    title = 'Ecoguard',
    class: className = '',
    children,
  }: NavbarProps & { children?: import('svelte').Snippet } = $props();
</script>

<header class="{navbarClass} {className}" data-slot="navbar">
  <h1 class={navbarTitleClass}>{title}</h1>
  <div class="flex items-center gap-3">
    {#if children}{@render children()}{/if}
  </div>
</header>
