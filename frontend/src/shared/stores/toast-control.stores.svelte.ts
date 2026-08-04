import type { ToastProps, ToastItem } from '@components/atoms/toast/toast.types';

// ponytail: module-level $state queue — bisa di-import Svelte/React manapun
let _queue = $state<ToastItem[]>([]);

let _counter = 0;

export function createToast(props: ToastProps): string {
  const id = `toast-${++_counter}`;
  const item: ToastItem = {
    id,
    title: props.title,
    description: props.description ?? '',
    variant: props.variant ?? 'default',
    duration: props.duration ?? 4000,
  };
  _queue = [..._queue, item];

  if ((item.duration ?? 0) > 0) {
    setTimeout(() => dismissToast(id), item.duration);
  }

  return id;
}

export function dismissToast(id: string): void {
  _queue = _queue.filter((t) => t.id !== id);
}

export const toastControl = {
  get queue() { return _queue; },
};
