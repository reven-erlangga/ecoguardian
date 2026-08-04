import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-base w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-main text-main-foreground',
        neutral: 'bg-secondary-background text-foreground',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-300 text-black',
        danger: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
