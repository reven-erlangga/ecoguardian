import { cn } from '$shared/utils/cn';
import type { CardProps } from './card.types';

export function useCard(p: CardProps) {
  return {
    classes: cn('bg-white neo-border neo-shadow p-6', p.class ?? ''),
  };
}
