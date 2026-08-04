<script lang="ts">
  // ponytail: Map atom — neobrutalism, marker + cluster variants
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import type { MapProps } from './map.types';
  import { OSM_STYLE, mapContainer, TYPE_COLORS } from './map.component';

  let {
    variant = 'marker',
    lat = null,
    lon = null,
    zoom = 13,
    height = '300px',
    interactive = true,
    address = '',
    markers = [],
    typeColors = TYPE_COLORS,
    class: className = '',
  }: MapProps = $props();

  let container: HTMLDivElement | undefined = $state();
  let mapInstance: maplibregl.Map | null = null;
  let loading = $state(true);
  let error = $state('');

  function buildMarkerMap() {
    if (!container || !lat || !lon) return;
    if (mapInstance) return;

    const map = new maplibregl.Map({
      container,
      style: OSM_STYLE,
      center: [lon, lat],
      zoom,
      interactive,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    new maplibregl.Marker({ color: '#2563EB' })
      .setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup().setText(address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`))
      .addTo(map);

    mapInstance = map;
    loading = false;
  }

  function buildClusterMap() {
    if (!container) return;
    if (mapInstance) return;

    const map = new maplibregl.Map({
      container,
      style: OSM_STYLE,
      center: [115, -2.5],
      zoom: 4,
      attributionControl: false,
      interactive,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      const bounds = new maplibregl.LngLatBounds();
      const features: any[] = [];

      for (const m of markers) {
        const lng = Number(m.lon);
        const latVal = Number(m.lat);
        if (!lng || !latVal) continue;
        bounds.extend([lng, latVal]);
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, latVal] },
          properties: {
            id: m.id,
            type: m.type || '',
            address: m.address || '',
            color: (m.type && typeColors[m.type]) || m.color || '#6B7280',
          },
        });
      }

      if (features.length === 0) {
        error = 'Tidak ada data lokasi.';
        loading = false;
        return;
      }

      map.fitBounds(bounds, { padding: 60, maxZoom: 10 });

      map.addSource('issues', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 40,
      });

      map.addLayer({
        id: 'cluster-circle',
        type: 'circle',
        source: 'issues',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#2563EB',
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'issues',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count'], 'text-size': 14 },
        paint: { 'text-color': '#fff' },
      });

      map.addLayer({
        id: 'marker',
        type: 'circle',
        source: 'issues',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      map.on('click', 'marker', (e) => {
        const p = e.features?.[0]?.properties;
        if (!p) return;
        new maplibregl.Popup({ offset: 25 })
          .setLngLat((e.features?.[0]?.geometry as any)?.coordinates || [0, 0])
          .setHTML(`<strong>${p.address || 'Tidak ada lokasi'}</strong><br/>Tipe: ${p.type}`)
          .addTo(map);
      });

      map.on('mouseenter', 'marker', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'marker', () => { map.getCanvas().style.cursor = ''; });

      loading = false;
    });

    mapInstance = map;
  }

  onMount(() => {
    if (variant === 'cluster') {
      buildClusterMap();
    } else {
      buildMarkerMap();
    }
  });

  onDestroy(() => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  });
</script>

<div class="{mapContainer} {className}">
  {#if error}
    <div class="flex items-center justify-center" style="height: {height};" role="alert">
      <p class="text-sm text-muted-foreground font-heading">{error}</p>
    </div>
  {:else}
    <div class="relative" style="height: {height}; width: 100%;">
      {#if loading}
        <div class="absolute inset-0 z-10 animate-pulse">
          <div class="h-full w-full bg-secondary-background border-2 border-border rounded-base"></div>
        </div>
      {/if}
      <div bind:this={container} class="h-full w-full"></div>
    </div>
  {/if}
</div>
