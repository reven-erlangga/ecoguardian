// ponytail: class CSS persis sama dengan neobrutalism ui/input.tsx
// source of truth: @/components/ui/input.tsx

const BASE =
  'flex h-10 w-full rounded-base border-2 bg-secondary-background px-3 py-2 text-sm font-base text-foreground file:border-0 file:bg-transparent file:text-sm file:font-heading placeholder:text-foreground/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function inputClasses({ error = '', className = '' }: { error?: string; className?: string }) {
  const border = error ? 'border-destructive' : 'border-border';
  return [BASE, border, className].filter(Boolean).join(' ');
}
