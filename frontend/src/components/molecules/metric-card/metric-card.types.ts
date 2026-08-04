import type { ComponentType } from 'svelte';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ComponentType;
  color?: 'blue' | 'green' | 'yellow' | 'red' | string;
  class?: string;
}
