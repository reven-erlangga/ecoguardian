import type { BadgeProps } from './badge.types';

export function useBadge(p: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-gray-200 text-black',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    danger: 'bg-red-500 text-white',
  };

  return {
    classes: [
      variants[p.variant ?? 'default'],
      'neo-border px-3 py-1 text-sm font-bold inline-block',
    ]
      .filter(Boolean)
      .join(' '),
  };
}
