import { cn } from '$shared/utils/cn';
import type { TweetCardProps } from './tweet-card.types';

export function useTweetCard(p: TweetCardProps) {
  const badgeVariant =
    p.label === 'positive'
      ? ('success' as const)
      : p.label === 'negative'
        ? ('danger' as const)
        : ('warning' as const);

  return {
    containerClasses: cn('bg-white neo-border neo-shadow p-5 space-y-3'),
    badgeVariant,
    confidencePct: p.confidence ? Math.round(p.confidence * 100) : undefined,
  };
}
