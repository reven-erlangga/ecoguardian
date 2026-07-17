export type EmptyStateIcon = 'MessageSquareText' | 'Bell' | 'Box' | 'SearchX' | 'TriangleAlert';

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}
