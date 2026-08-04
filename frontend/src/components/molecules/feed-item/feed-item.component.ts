import { cn } from '$shared/utils/cn';

const typeColors: Record<string, string> = {
  info: 'border-l-blue-500',
  warning: 'border-l-yellow-500',
  alert: 'border-l-red-500',
  success: 'border-l-green-500',
  error: 'border-l-red-600',
};

export function useFeedItem(type: string, unread?: boolean) {
  return {
    containerClasses: cn(
      'bg-secondary-background border-2 border-border rounded-base p-4 border-l-4 transition-all duration-100',
      typeColors[type] ?? 'border-l-gray-300',
      unread ? 'bg-blue-50' : '',
    ),
    titleClasses: cn('font-heading', unread ? 'text-black' : 'text-gray-700'),
    unreadDot: unread,
  };
}
