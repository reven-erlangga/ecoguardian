import { cn } from '$shared/utils/cn';
import type { NavItemProps } from './nav-item.types';

export function useNavItem(p: NavItemProps) {
  return {
    classes: cn(
      'flex items-center gap-3 neo-border px-4 py-3 font-bold transition-all duration-100',
      p.active
        ? 'bg-blue-600 text-white neo-shadow'
        : 'bg-white hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
    ),
    ariaCurrent: p.active ? ('page' as const) : undefined,
  };
}
