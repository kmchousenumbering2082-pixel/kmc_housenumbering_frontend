"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Circle, GeoJSON, LatLng, Layer, Map as LeafletMap, Marker, TileLayer } from "leaflet";

import { QUICK_STATS, WARDS, type LayerKey, type ToolKey } from "@/components/kmc/constants";
import { KmcHeader } from "@/components/kmc/header";
import { MapShell } from "@/components/kmc/map-shell";
import { StatsStrip } from "@/components/kmc/stats-strip";
import { KmcToolbar } from "@/components/kmc/toolbar";
import { buildApiPreview, normalizeToGeoJson } from "@/lib/kmc-geojson";

export function KmcDashboard() {
  const PALIKA_GEOMETRY_API = "/api/palika-geometry";
  const WARD_GEOMETRY_API = "/api/palika-profiles";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeWard, setActiveWard] = useState("All Wards");
  const [activeLayer, setActiveLayer] = useState<LayerKey>("osm");
  const [activeTool, setActiveTool] = useState<ToolKey>("map");
  const [lastLocatedLabel, setLastLocatedLabel] = useState("No location selected");
  const [apiOverlayLines, setApiOverlayLines] = useState<string[]>(["Loading API data..."]);
  const [apiOverlayStatus, setApiOverlayStatus] = useState("Connecting...");
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const wardLayerRef = useRef<GeoJSON | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const mapReadyRef = useRef(false);
  const baseLayersRef = useRef<Record<LayerKey, TileLayer> | null>(null);
  const palikaLayerRef = useRef<GeoJSON | null>(null);
  const searchMarkerRef = useRef<Marker | null>(null);
  const locateMarkerRef = useRef<Marker | null>(null);
  const locateCircleRef = useRef<Circle | null>(null);

  const quickStats = useMemo(() => QUICK_STATS, []);

  const searchAndLocate = async () => {
    const map = leafletMapRef.current;
    const q = searchQuery.trim();
    if (!map || !q) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
      );
      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) return;

      const lat = Number(results[0].lat);
      const lon = Number(results[0].lon);
      const label = String(results[0].display_name || q);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;

      const L = (await import("leaflet")).default;
      map.setView([lat, lon], 18, { animate: true });

      if (searchMarkerRef.current) map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
      setLastLocatedLabel(label);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapReadyRef.current) return;

    let isUnmounted = false;
    let map: LeafletMap | null = null;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        (globalThis as { L?: unknown }).L = L;

        try {
          await import("leaflet-control-geocoder");
        } catch {}
        try {
          await import("leaflet-draw");
        } catch {}

        if (isUnmounted || !mapRef.current || leafletMapRef.current) return;

        map = L.map(mapRef.current, { zoomControl: true }).setView([27.7172, 85.324], 14);
        leafletMapRef.current = map;
        mapReadyRef.current = true;
        setIsMapReady(true);

        const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 20,
        });
        const hot = L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap HOT",
          maxZoom: 20,
        });
        const satellite = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          maxZoom: 21,
          attribution: "Map data &copy; Google",
        });
        const hybrid = L.tileLayer("https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          maxZoom: 21,
          attribution: "Map data &copy; Google",
        });

        const toQuadKey = (x: number, y: number, z: number): string => {
          let quadKey = "";
          for (let i = z; i > 0; i -= 1) {
            let digit = 0;
            const mask = 1 << (i - 1);
            if ((x & mask) !== 0) digit += 1;
            if ((y & mask) !== 0) digit += 2;
            quadKey += digit.toString();
          }
          return quadKey;
        };

        const TileLayerWithExtend = L.TileLayer as typeof L.TileLayer & {
          extend: (props: { getTileUrl: (coords: { x: number; y: number; z: number }) => string }) => {
            new (...args: unknown[]): TileLayer;
          };
        };
        const BingLayer = TileLayerWithExtend.extend({
          getTileUrl(coords: { x: number; y: number; z: number }) {
            const quadKey = toQuadKey(coords.x, coords.y, coords.z);
            const server = (coords.x + coords.y) % 4;
            return `https://ecn.t${server}.tiles.virtualearth.net/tiles/a${quadKey}.jpeg?g=1`;
          },
        });

        const bing = new BingLayer();
        bing.options.maxZoom = 19;
        bing.options.attribution = "Bing Maps";
        baseLayersRef.current = { osm, hot, satellite, hybrid, bing };
        osm.addTo(map);

        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        const drawControlCtor = (L.Control as unknown as {
          Draw?: new (options: unknown) => L.Control;
        }).Draw;
        if (drawControlCtor) {
          map.addControl(
            new drawControlCtor({
              position: "topleft",
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
          map.on("draw:created", (event: unknown) => {
            if (typeof event === "object" && event && "layer" in event) {
              const layer = (event as { layer: Layer }).layer;
              drawnItems.addLayer(layer);
            }
          });
        }

        map.on("locationfound", (event: unknown) => {
          if (
            !event ||
            typeof event !== "object" ||
            !("latlng" in event) ||
            !("accuracy" in event)
          ) {
            return;
          }
          const located = event as { latlng: LatLng; accuracy: number };
          if (locateMarkerRef.current) map.removeLayer(locateMarkerRef.current);
          if (locateCircleRef.current) map.removeLayer(locateCircleRef.current);

          locateMarkerRef.current = L.marker(located.latlng).addTo(map).bindPopup("You are here").openPopup();
          locateCircleRef.current = L.circle(located.latlng, {
            radius: located.accuracy,
            color: "#2563eb",
            fillColor: "#60a5fa",
            fillOpacity: 0.2,
            weight: 1,
          }).addTo(map);
          setLastLocatedLabel(`Current location: ${located.latlng.lat.toFixed(5)}, ${located.latlng.lng.toFixed(5)}`);
        });

        const LocateControl = L.Control.extend({
          options: { position: "topleft" },
          onAdd() {
            const button = L.DomUtil.create("button", "kmc-map-btn");
            button.type = "button";
            button.title = "Current Location";
            button.innerHTML = "📍";
            L.DomEvent.disableClickPropagation(button);
            L.DomEvent.on(button, "click", () => {
              if (map) map.locate({ setView: true, maxZoom: 18, enableHighAccuracy: true });
            });
            return button;
          },
        });
        map.addControl(new LocateControl());

        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 160);
      } catch (error) {
        console.error("Map initialization failed:", error);
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
      palikaLayerRef.current = null;
      wardLayerRef.current = null;
      searchMarkerRef.current = null;
      locateMarkerRef.current = null;
      locateCircleRef.current = null;
      if (map) map = null;
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!isMapReady) return;
    const map = leafletMapRef.current;
    if (!map) return;

    let isCancelled = false;

    const loadPalikaGeometry = async () => {
      setApiOverlayStatus("Loading palika geometry...");
      try {
        const response = await fetch(PALIKA_GEOMETRY_API, { cache: "no-store" });
        if (!response.ok) throw new Error(`Geometry request failed (${response.status})`);

        const payload = await response.json();
        const geoJson = normalizeToGeoJson(payload);
        if (!geoJson) throw new Error("API response does not contain valid geometry.");
        if (isCancelled) return;

        if (palikaLayerRef.current) map.removeLayer(palikaLayerRef.current);

        const Leaflet = (await import("leaflet")).default;
        const layer = Leaflet.geoJSON(geoJson, {
          style: {
            color: "#2563eb",
            weight: 2,
            fillColor: "#60a5fa",
            fillOpacity: 0.2,
          },
        }).addTo(map);
        palikaLayerRef.current = layer;

        const bounds = layer.getBounds?.();
        if (bounds?.isValid?.()) map.fitBounds(bounds, { padding: [20, 20] });

        setApiOverlayStatus("Palika geometry loaded");
        setApiOverlayLines(buildApiPreview(payload, geoJson));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load geometry";
        setApiOverlayStatus("Geometry load failed");
        setApiOverlayLines([message, "Check API reachability and payload shape."]);
        console.error("Failed to render palika geometry:", error);
      }
    };

    loadPalikaGeometry();
    return () => {
      isCancelled = true;
    };
  }, [PALIKA_GEOMETRY_API, isMapReady]);

  useEffect(() => {
    if (!isMapReady) return;
    const map = leafletMapRef.current;
    if (!map) return;

    let isCancelled = false;

    const loadWardGeometry = async () => {
      try {
        setApiOverlayStatus("Loading ward boundaries...");
        const errors: string[] = [];
        let payload: unknown = null;

        try {
          const response = await fetch(WARD_GEOMETRY_API, { cache: "no-store" });
          if (!response.ok) {
            errors.push(`${WARD_GEOMETRY_API} -> ${response.status}`);
          } else {
            payload = await response.json();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "fetch failed";
          errors.push(`${WARD_GEOMETRY_API} -> ${message}`);
        }

        if (!payload) throw new Error(`Ward API failed (${errors.join(" | ")})`);
        const geoJson = normalizeToGeoJson(payload);
        if (!geoJson) throw new Error("Invalid ward geometry");
        if (isCancelled) return;

        if (wardLayerRef.current) map.removeLayer(wardLayerRef.current);

        const Leaflet = (await import("leaflet")).default;
        const layer = Leaflet.geoJSON(geoJson, {
          style: {
            color: "#f59e0b",
            weight: 1,
            fillColor: "#fbbf24",
            fillOpacity: 0.15,
          },
          pointToLayer: (_feature: GeoJSON.Feature, latlng: LatLng) =>
            Leaflet.circleMarker(latlng, {
              radius: 4,
              color: "#b45309",
              weight: 1,
              fillColor: "#f59e0b",
              fillOpacity: 0.9,
            }),
        }).addTo(map);

        wardLayerRef.current = layer;
        setApiOverlayStatus("Ward boundaries loaded");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown ward error";
        console.error("Ward load failed:", error);
        setApiOverlayStatus("Ward load failed");
        setApiOverlayLines((prev) => [...prev.slice(0, 3), `Ward API: ${message}`]);
      }
    };

    loadWardGeometry();
    return () => {
      isCancelled = true;
    };
  }, [WARD_GEOMETRY_API, isMapReady]);

  useEffect(() => {
    const map = leafletMapRef.current;
    const layers = baseLayersRef.current;
    if (!map || !layers) return;

    const selected = layers[activeLayer];
    if (!selected) return;

    (Object.keys(layers) as LayerKey[]).forEach((key) => {
      const layer = layers[key];
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    selected.addTo(map);
  }, [activeLayer]);

  useEffect(() => {
    const map = leafletMapRef.current;
    const el = mapRef.current;
    if (!map || !el) return;

    const refresh = () => requestAnimationFrame(() => map.invalidateSize());
    refresh();
    window.addEventListener("resize", refresh);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(refresh) : null;
    if (observer) observer.observe(el);

    return () => {
      window.removeEventListener("resize", refresh);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <main className="flex h-screen flex-col gap-2 bg-blue-50 p-2 text-slate-900">
      <KmcHeader />
      <StatsStrip stats={quickStats} />
      <KmcToolbar
        wards={WARDS}
        activeWard={activeWard}
        searchQuery={searchQuery}
        onWardChange={setActiveWard}
        onSearchQueryChange={setSearchQuery}
        onLocate={searchAndLocate}
      />
      <MapShell
        mapRef={mapRef}
        activeTool={activeTool}
        activeLayer={activeLayer}
        lastLocatedLabel={lastLocatedLabel}
        onToolChange={setActiveTool}
        onLayerChange={setActiveLayer}
      />

      <div className="hidden">
        <p>{apiOverlayStatus}</p>
        {apiOverlayLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </main>
  );
}
