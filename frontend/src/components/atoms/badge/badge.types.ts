import type { Snippet } from 'svelte';

export type BadgeVariant = 'default' | 'neutral' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  variant?: BadgeVariant;
  children?: Snippet;
  class?: string;
}
