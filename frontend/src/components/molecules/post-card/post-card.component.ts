import { cn } from '$shared/utils/cn';
import type { PostCardProps } from './post-card.types';

export function usePostCard(p: PostCardProps) {
  const badgeVariant =
    p.label === 'positive' ? 'success' :
    p.label === 'negative' ? 'danger' : 'warning';

  const pct = p.confidence !== undefined ? Math.round(p.confidence * 100) : undefined;

  return {
    containerClasses: cn('bg-secondary-background border-2 border-border rounded-base shadow-shadow p-5 space-y-3'),
    badgeVariant: badgeVariant as 'success' | 'danger' | 'warning',
    confidencePct: pct,
  };
}
