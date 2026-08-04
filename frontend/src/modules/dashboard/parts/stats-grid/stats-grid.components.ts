// ponytail: CSS classes untuk StatsGrid

export const gridClass =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

export const cardClass =
  'border-2 border-border shadow-shadow rounded-lg bg-card p-4';

export const labelClass = 'text-sm font-medium text-muted-foreground';
export const valueClass = 'mt-1 text-3xl font-heading text-foreground';

export const barTrackClass = 'mt-2 h-1.5 w-full rounded-full bg-muted';
export const barFillClass = 'h-full rounded-full transition-all';

export const TYPE_COLORS: Record<string, string> = {
  fallen_tree: 'bg-green-500',
  garbage: 'bg-yellow-500',
  vandalism: 'bg-destructive',
  deforestation: 'bg-green-600',
  water_pollution: 'bg-blue-500',
  air_pollution: 'bg-purple-500',
  illegal_mining: 'bg-red-600',
  wildlife_trafficking: 'bg-orange-500',
  coral_bleaching: 'bg-cyan-500',
  coastal_erosion: 'bg-amber-600',
  waste_management: 'bg-indigo-500',
};

export const DEFAULT_COLORS = ['bg-primary', 'bg-accent', 'bg-secondary'];