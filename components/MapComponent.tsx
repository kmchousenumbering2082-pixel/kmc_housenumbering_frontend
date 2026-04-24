'use client';


import { useEffect, useRef } from 'react';

interface MapComponentProps {
  activeLayer: string;
  searchQuery: string;
  activeWard: string;
  onLocationUpdate: (label: string) => void;
}

export default function MapComponent({ activeLayer, searchQuery, activeWard, onLocationUpdate }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const mapReadyRef = useRef(false);
  const baseLayersRef = useRef<Record<string, any> | null>(null);

  // Initialize map on mount
  useEffect(() => {
    if (!mapRef.current || mapReadyRef.current) return;

    let isUnmounted = false;
    let map: any = null;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        (globalThis as any).L = L;

        // Optional plugins
        try {
          // @ts-ignore
          await import('leaflet-control-geocoder');
        } catch (e) {
          console.warn('Geocoder plugin failed to load');
        }
        try {
          // @ts-ignore
          await import('leaflet-draw');
        } catch (e) {
          console.warn('Draw plugin failed to load');
        }

        if (isUnmounted || !mapRef.current || leafletMapRef.current) return;

        // Create map
        console.log('Creating map with Leaflet...');
        map = L.map(mapRef.current, { zoomControl: true }).setView([27.7172, 85.324], 14);
        console.log('Map created:', map);
        leafletMapRef.current = map;
        mapReadyRef.current = true;

        // Base layers
        console.log('Adding base layers...');
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 20,
        });
        const hot = L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap HOT',
          maxZoom: 20,
        });
        const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          maxZoom: 21,
          attribution: 'Map data &copy; Google',
        });
        const hybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          maxZoom: 21,
          attribution: 'Map data &copy; Google',
        });

        // Bing layer
        const toQuadKey = (x: number, y: number, z: number): string => {
          let quadKey = '';
          for (let i = z; i > 0; i -= 1) {
            let digit = 0;
            const mask = 1 << (i - 1);
            if ((x & mask) !== 0) digit += 1;
            if ((y & mask) !== 0) digit += 2;
            quadKey += digit.toString();
          }
          return quadKey;
        };
        const BingLayer = (L.TileLayer as any).extend({
          getTileUrl(coords: { x: number; y: number; z: number }) {
            const quadKey = toQuadKey(coords.x, coords.y, coords.z);
            const server = (coords.x + coords.y) % 4;
            return `https://ecn.t${server}.tiles.virtualearth.net/tiles/a${quadKey}.jpeg?g=1`;
          },
        });
        const bing = new BingLayer('', { maxZoom: 19, attribution: 'Bing Maps' });

        baseLayersRef.current = { osm, hot, satellite, hybrid, bing };
        console.log('Adding OSM to map...');
        osm.addTo(map);
        console.log('OSM added to map');

        // Layer control
        L.control
          .layers({
            OSM: osm,
            HOT: hot,
            Satellite: satellite,
            Hybrid: hybrid,
            Bing: bing,
          })
          .addTo(map);

        // Geocoder
        const geocoderFactory = (L.Control as any).geocoder;
        if (typeof geocoderFactory === 'function') {
          geocoderFactory({ defaultMarkGeocode: true }).addTo(map);
        }

        // Draw functionality
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        const DrawControl = (L.Control as any).Draw;
        if (DrawControl) {
          map.addControl(
            new DrawControl({
              position: 'topleft',
              draw: {
                polyline: true,
                polygon: true,
                rectangle: true,
                circle: false,
                marker: true,
                circlemarker: false,
              },
              edit: { featureGroup: drawnItems },
            })
          );
          map.on('draw:created', (e: any) => drawnItems.addLayer(e.layer));
        }

        // Location handler
        map.on('locationfound', (e: any) => {
          const label = `Current location: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
          onLocationUpdate(label);
        });

        // Locate control
        const LocateControl = L.Control.extend({
          options: { position: 'topleft' },
          onAdd() {
            const button = L.DomUtil.create('button', 'kmc-map-btn');
            button.type = 'button';
            button.title = 'Current Location';
            button.innerHTML = '📍';
            L.DomEvent.disableClickPropagation(button);
            L.DomEvent.on(button, 'click', () => {
              map.locate({ setView: true, maxZoom: 18, enableHighAccuracy: true });
            });
            return button;
          },
        });
        map.addControl(new LocateControl());

        // Fix map size
        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 160);
      } catch (error) {
        console.error('Map initialization failed:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `<div style="padding: 20px; color: red;">Error loading map: ${String(error)}</div>`;
        }
      }
    })();

    return () => {
      isUnmounted = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      mapReadyRef.current = false;
      baseLayersRef.current = null;
      if (map) map = null;
    };
  }, [onLocationUpdate]);

  // Handle layer switching
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    const layers = baseLayersRef.current;
    if (!layers) return;

    const selected = layers[activeLayer];
    if (!selected) return;

    (Object.keys(layers) as string[]).forEach((key) => {
      const layer = layers[key];
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    selected.addTo(map);
  }, [activeLayer]);

  // Handle window resize
  useEffect(() => {
    const map = leafletMapRef.current;
    const el = mapRef.current;
    if (!map || !el) return;

    const refresh = () => requestAnimationFrame(() => map.invalidateSize());
    refresh();
    window.addEventListener('resize', refresh);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refresh) : null;
    if (observer) observer.observe(el);

    return () => {
      window.removeEventListener('resize', refresh);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div 
      id="map" 
      ref={mapRef} 
      className="map-canvas" 
      style={{ width: '100%', height: '100%' }}
    />
  );
}
