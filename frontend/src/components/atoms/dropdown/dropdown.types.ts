import type { Snippet } from 'svelte';

export interface DropdownItem {
  value: string;
  label: string;
}

export interface DropdownProps {
  items: DropdownItem[];
  selected?: string;
  onchange?: (value: string) => void;
  label?: string;
  icon?: Snippet;
  class?: string;
}
