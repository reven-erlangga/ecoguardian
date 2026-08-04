import type { Snippet } from 'svelte';

export interface LabelProps {
  for?: string;
  children?: Snippet;
  class?: string;
}
