export interface StatItem {
  title: string;
  value: number;
  icon: string;
  color?: string;
}

export interface StatsGridProps {
  items?: StatItem[];
}
