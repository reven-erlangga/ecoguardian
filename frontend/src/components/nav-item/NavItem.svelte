<script lang="ts">
  import type { NavItemProps } from './nav-item.types';
  import { cn } from '$shared/utils/cn';
  let { href, label, active, class: className, children }: NavItemProps = $props();
</script>

<a {href} class={cn(
  'flex items-center gap-3 neo-border px-4 py-3 font-bold transition-all duration-100',
  active ? 'bg-blue-600 text-white neo-shadow' : 'bg-white hover:bg-gray-100 hover:translate-x-[2px]',
  className
)}>
  {@render children?.()}
  <span>{label}</span>
</a>
