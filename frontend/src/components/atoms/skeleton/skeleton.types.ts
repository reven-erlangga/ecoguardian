export type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  class?: string;
}
