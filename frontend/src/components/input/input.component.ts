import type { InputProps } from './input.types';

export function useInput(p: InputProps) {
  return {
    classes: [
      'neo-border bg-white px-4 py-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-100',
      p.error ? 'border-red-500 ring-red-500' : '',
      p.class ?? '',
    ]
      .filter(Boolean)
      .join(' '),
  };
}
