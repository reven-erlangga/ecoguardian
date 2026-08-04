import type { LabelProps } from './label.types';

export function useLabel(_p: LabelProps) {
  return {
    classes: 'text-sm font-base font-bold block',
  };
}
