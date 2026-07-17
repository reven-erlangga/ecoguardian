import type { Snippet } from 'svelte';

export interface FormFieldProps {
  label: string;
  error?: string;
  children?: Snippet;
}
