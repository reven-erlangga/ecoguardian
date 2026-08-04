import type { Snippet } from 'svelte';

export type CardVariant = 'default' | 'image' | 'gallery';

export interface CardProps {
  variant?: CardVariant;
  // default variant
  title?: string;
  subtitle?: string;
  icon?: Snippet;
  action?: Snippet;
  children?: Snippet;
  footer?: Snippet;
  // image variant
  imageUrl?: string;
  caption?: string;
  // gallery variant
  urls?: string[];
  class?: string;
}
