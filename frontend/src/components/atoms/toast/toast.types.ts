export type ToastVariant = 'success' | 'error' | 'warning' | 'default';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number; // ms, 0 = no auto-close
}

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}
