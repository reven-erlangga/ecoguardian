export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  class?: string;
  onclick?: () => void;
  children?: import('svelte').Snippet;
  type?: 'button' | 'submit';
}
