export type MapVariant = 'marker' | 'cluster';

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  type?: string;
  address?: string;
  color?: string;
}

export interface MapProps {
  variant?: MapVariant;
  // marker variant
  lat?: number | null;
  lon?: number | null;
  address?: string;
  // shared
  zoom?: number;
  height?: string;
  interactive?: boolean;
  // cluster variant
  markers?: MapMarker[];
  typeColors?: Record<string, string>;
  class?: string;
}
