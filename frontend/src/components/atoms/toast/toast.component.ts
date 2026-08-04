import type { ToastVariant } from './toast.types';

// ponytail: class CSS per variant — neobrutalism style seperti Sonner
const base = 'border-2 border-border rounded-base shadow-shadow px-4 py-3 text-sm font-base flex items-start gap-3 min-w-[300px] max-w-[420px]';

export const toastVariants: Record<ToastVariant, string> = {
  success: `${base} bg-green-50 text-green-800 border-green-400`,
  error: `${base} bg-red-50 text-red-800 border-red-400`,
  warning: `${base} bg-yellow-50 text-yellow-800 border-yellow-400`,
  default: `${base} bg-card text-foreground`,
};

export const toastContainer = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
export const toastItem = 'pointer-events-auto animate-in slide-in-from-right-2 fade-in duration-200';
