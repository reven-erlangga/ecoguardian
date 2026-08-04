export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'noShadow';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

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
