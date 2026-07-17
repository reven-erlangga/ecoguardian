<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let { lat, lon, zoom = 13, address = '', interactive = true, height = '300px' }: {
    lat: number | null; lon: number | null; zoom?: number;
    address?: string; interactive?: boolean; height?: string;
  } = $props();

  let container: HTMLDivElement;
  let map: maplibregl.Map | null = null;

  onMount(() => {
    if (!container || !lat || !lon) return;
    if (map) return;

    map = new maplibregl.Map({
      container,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lon, lat],
      zoom,
      interactive,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    new maplibregl.Marker({ color: '#2563EB' })
      .setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup().setText(address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`))
      .addTo(map);

    return () => { if (map) { map.remove(); map = null; } };
  });
</script>

<div bind:this={container} style="height: {height}; width: 100%;" class="neo-border overflow-hidden rounded"></div>
