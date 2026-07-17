import { cn } from '$shared/utils/cn';
import type { NotifItemProps } from './notif-item.types';

export function useNotifItem(p: NotifItemProps) {
  const typeColors: Record<string, string> = {
    info: 'border-l-blue-500',
    warning: 'border-l-yellow-500',
    alert: 'border-l-red-500',
    success: 'border-l-green-500',
    error: 'border-l-red-600',
  };

  return {
    containerClasses: cn(
      'bg-white neo-border p-4 border-l-4 transition-all duration-100',
      typeColors[p.type] ?? 'border-l-gray-300',
      p.unread ? 'bg-blue-50' : '',
    ),
    titleClasses: cn('font-bold', p.unread ? 'text-black' : 'text-gray-700'),
    unreadDot: p.unread,
  };
}
