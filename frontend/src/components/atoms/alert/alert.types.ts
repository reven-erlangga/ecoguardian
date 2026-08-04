import type { Snippet } from 'svelte';

export type AlertVariant = 'default' | 'destructive';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: Snippet;
  duration?: number;
  onDismiss?: () => void;
  class?: string;
}
