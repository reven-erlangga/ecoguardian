// ponytail: class CSS persis sama dengan neobrutalism ui/button.tsx (cva variants)
// source of truth: @/components/ui/button.tsx

const BASE =
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all gap-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const SIZE_CLASSES: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'size-10',
};

const VARIANT_CLASSES: Record<string, string> = {
  default:
    'text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
  destructive:
    'text-destructive-foreground bg-destructive border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
  outline:
    'bg-secondary-background text-foreground border-2 border-border hover:bg-accent',
  secondary:
    'bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
  ghost:
    'text-foreground hover:bg-accent hover:text-accent-foreground',
  noShadow:
    'text-main-foreground bg-main border-2 border-border',
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className = '',
}: {
  variant?: string;
  size?: string;
  className?: string;
}) {
  const vc = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;
  const sc = SIZE_CLASSES[size] || SIZE_CLASSES.default;
  return [BASE, vc, sc, className].filter(Boolean).join(' ');
}
