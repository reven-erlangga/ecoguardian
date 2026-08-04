// ponytail: Card base CSS — neobrutalism style sama seperti ui/card.tsx
import { cva } from 'class-variance-authority';

export const cardVariants = cva('rounded-base border-2 border-border shadow-shadow bg-background text-foreground font-base overflow-hidden', {
  variants: {
    variant: {
      default: '',
      image: '',
      gallery: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
