export interface NavItemProps {
  href: string;
  label: string;
  active?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}
