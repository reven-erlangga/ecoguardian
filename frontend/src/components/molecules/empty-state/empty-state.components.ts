import type { EmptyStateProps } from './empty-state.types';

export function useEmptyState(p: EmptyStateProps) {
  return {
    rootClass: ['border-2 border-border rounded-base bg-secondary-background shadow-shadow p-8 text-center max-w-md mx-auto']
      .filter(Boolean)
      .join(' '),
    iconWrapClass: 'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted',
    titleClass: 'text-xl font-heading mb-2',
    descClass: 'text-sm text-muted-foreground mb-6',
    actionClass:
      'border-2 border-border rounded-base shadow-shadow inline-block bg-main px-6 py-2 text-sm font-heading text-main-foreground no-underline hover:bg-primary/90',
  };
}
