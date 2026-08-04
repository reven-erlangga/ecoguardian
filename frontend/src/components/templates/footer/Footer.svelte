<script lang="ts">
  import { footerClass, footerTextClass } from './footer.component';
  import type { FooterProps } from './footer.types';

  let {
    text = `© ${new Date().getFullYear()} Ecoguard. All rights reserved.`,
    class: className = '',
  }: FooterProps = $props();
</script>

<footer class="{footerClass} {className}" data-slot="footer">
  <p class={footerTextClass}>{text}</p>
</footer>
