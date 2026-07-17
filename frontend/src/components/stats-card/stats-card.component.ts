import type { StatsCardProps } from './stats-card.types';

export function useStatsCard(p: StatsCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-600',
    green: 'border-l-green-600',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
    purple: 'border-l-purple-600',
  };

  const colorClass = colorMap[p.color ?? 'blue'] ?? `border-l-${p.color}-500`;

  return {
    containerClasses: [
      'bg-white neo-border neo-shadow p-5 border-l-4',
      colorClass,
      p.class ?? '',
    ]
      .filter(Boolean)
      .join(' '),
    valueDisplay:
      typeof p.value === 'number' ? p.value.toLocaleString() : p.value,
  };
}
