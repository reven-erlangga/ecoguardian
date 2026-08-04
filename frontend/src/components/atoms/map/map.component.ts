// ponytail: OSM raster tile style — gratis, gak perlu API key
import type { StyleSpecification } from 'maplibre-gl';

export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

export const mapContainer =
  'border-2 border-border rounded-base bg-secondary-background shadow-shadow overflow-hidden';

export const TYPE_COLORS: Record<string, string> = {
  deforestation: '#16A34A',
  water_pollution: '#2563EB',
  air_pollution: '#9333EA',
  illegal_mining: '#DC2626',
  wildlife_trafficking: '#D97706',
  coral_bleaching: '#0891B2',
  coastal_erosion: '#B45309',
  waste_management: '#4F46E5',
};
