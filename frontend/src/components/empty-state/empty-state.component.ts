import type { EmptyStateProps } from './empty-state.types';

export function useEmptyState(p: EmptyStateProps) {
  return {
    rootClass: ['neo-border bg-white neo-shadow p-8 text-center max-w-md mx-auto']
      .filter(Boolean)
      .join(' '),
    iconWrapClass: 'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted',
    titleClass: 'text-xl font-bold mb-2',
    descClass: 'text-sm text-muted-foreground mb-6',
    actionClass:
      'neo-border neo-shadow-sm inline-block bg-primary px-6 py-2 text-sm font-bold text-primary-foreground no-underline hover:bg-primary/90',
  };
}
