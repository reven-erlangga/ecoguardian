// ponytail: phosphor-svelte icon names
export type EmptyStateIcon =
  | 'cube'
  | 'bell'
  | 'chat'
  | 'chart'
  | 'file'
  | 'user'
  | 'map-pin'
  | 'TriangleAlert'
  | 'SearchX';

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}