// ponytail: Alert variants — neobrutalism CSS sama seperti button.component.ts
// Package class-variance-authority sudah installed, gak perlu React
import { cva } from 'class-variance-authority';

export const alertVariants = cva(
  'relative w-full rounded-base border-2 border-border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current shadow-shadow',
  {
    variants: {
      variant: {
        default: 'bg-main text-main-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const alertTitleClass = 'col-start-2 line-clamp-1 min-h-4 font-heading tracking-tight';
export const alertDescClass = 'col-start-2 grid justify-items-start gap-1 text-sm font-base [&_p]:leading-relaxed';
export const alertProgressBar = 'absolute bottom-0 left-0 h-1 bg-current/30 rounded-full transition-all';
