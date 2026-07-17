export function formatDate(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(seconds: number): string {
  return `${formatDate(seconds)} ${formatTime(seconds)}`;
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
