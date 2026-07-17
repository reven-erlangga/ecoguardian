import type { ButtonProps } from './button.types';

export function useButton(p: ButtonProps) {
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white',
    destructive: 'bg-red-600 text-white',
    outline: 'bg-white text-black',
    secondary: 'bg-green-600 text-white',
    ghost: 'bg-transparent border-transparent shadow-none',
  };

  const sizes: Record<string, string> = {
    default: 'h-12 px-6 text-base',
    sm: 'h-8 px-4 text-sm',
    lg: 'h-14 px-8 text-lg',
  };

  const base =
    'inline-flex items-center justify-center font-bold border-2 border-black transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none';

  return {
    classes: [
      base,
      variants[p.variant ?? 'default'],
      sizes[p.size ?? 'default'],
      p.class ?? '',
    ]
      .filter(Boolean)
      .join(' '),
    isDisabled: p.disabled || p.loading,
  };
}
