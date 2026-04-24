function stripOuterParens(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) return trimmed;
  return trimmed.slice(1, -1).trim();
}

function splitTopLevelComma(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }

  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function parseWktRing(ringText: string): number[][] {
  const ringBody = stripOuterParens(ringText);
  return ringBody
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [xRaw, yRaw] = pair.split(/\s+/);
      const x = Number(xRaw);
      const y = Number(yRaw);
      return [x, y];
    })
    .filter((coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]));
}

function parseWktPolygon(polygonText: string): number[][][] {
  const polygonBody = stripOuterParens(polygonText);
  return splitTopLevelComma(polygonBody)
    .map((ringText) => parseWktRing(ringText))
    .filter((ring) => ring.length >= 4);
}

function parseWktGeometry(wkt: string): GeoJSON.Geometry | null {
  if (!wkt || typeof wkt !== "string") return null;
  const trimmed = wkt.trim();
  const upper = trimmed.toUpperCase();

  if (upper.startsWith("MULTIPOLYGON")) {
    const body = stripOuterParens(trimmed.slice("MULTIPOLYGON".length));
    const polygons = splitTopLevelComma(body)
      .map((polygonText) => parseWktPolygon(polygonText))
      .filter((polygon) => polygon.length > 0);
    return polygons.length > 0 ? ({ type: "MultiPolygon", coordinates: polygons } as const) : null;
  }

  if (upper.startsWith("POLYGON")) {
    const body = stripOuterParens(trimmed.slice("POLYGON".length));
    const polygon = parseWktPolygon(body);
    return polygon.length > 0 ? ({ type: "Polygon", coordinates: polygon } as const) : null;
  }

  if (upper.startsWith("POINT")) {
    const body = stripOuterParens(trimmed.slice("POINT".length));
    const [xRaw, yRaw] = body.split(/\s+/);
    const x = Number(xRaw);
    const y = Number(yRaw);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { type: "Point", coordinates: [x, y] };
    }
  }

  return null;
}

export function normalizeToGeoJson(input: unknown): GeoJSON.Feature | GeoJSON.FeatureCollection | null {
  if (Array.isArray(input)) {
    const features = input
      .map((item) => normalizeToGeoJson(item))
      .filter(Boolean)
      .flatMap((item) => {
        if (item?.type === "FeatureCollection" && Array.isArray(item.features)) return item.features;
        if (item?.type === "Feature") return [item];
        return [];
      });

    return features.length > 0 ? { type: "FeatureCollection", features } : null;
  }

  if (!input || typeof input !== "object") return null;
  const maybeGeo = input as Record<string, unknown>;

  if (maybeGeo.type === "FeatureCollection" || maybeGeo.type === "Feature") {
    return maybeGeo as GeoJSON.FeatureCollection | GeoJSON.Feature;
  }

  if (typeof maybeGeo.type === "string" && maybeGeo.coordinates) {
    return { type: "Feature", geometry: maybeGeo as GeoJSON.Geometry, properties: {} };
  }

  const geometry = maybeGeo.geometry as Record<string, unknown> | undefined;
  if (geometry?.type && geometry.coordinates) {
    return {
      type: "Feature",
      geometry: geometry as GeoJSON.Geometry,
      properties: (maybeGeo.properties as GeoJSON.GeoJsonProperties) || {},
    };
  }

  if (Array.isArray(maybeGeo.features)) {
    return { type: "FeatureCollection", features: maybeGeo.features as GeoJSON.Feature[] };
  }

  if (Array.isArray(maybeGeo.geometries)) {
    return {
      type: "FeatureCollection",
      features: maybeGeo.geometries
        .filter((g): g is Record<string, unknown> => Boolean(g))
        .filter((g) => Boolean(g.type) && Boolean(g.coordinates))
        .map((g) => ({ type: "Feature", geometry: g as GeoJSON.Geometry, properties: {} })),
    };
  }

  if (typeof maybeGeo.geom === "string") {
    const wktGeometry = parseWktGeometry(maybeGeo.geom);
    if (wktGeometry) {
      const properties = { ...maybeGeo };
      delete properties.geom;
      return {
        type: "Feature",
        geometry: wktGeometry,
        properties,
      };
    }
  }

  const lat = Number(maybeGeo.lat ?? maybeGeo.latitude ?? maybeGeo.y);
  const lng = Number(maybeGeo.lng ?? maybeGeo.lon ?? maybeGeo.longitude ?? maybeGeo.x);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: maybeGeo,
    };
  }

  if (maybeGeo.data) return normalizeToGeoJson(maybeGeo.data);
  if (maybeGeo.result) return normalizeToGeoJson(maybeGeo.result);
  if (maybeGeo.current) return normalizeToGeoJson(maybeGeo.current);
  return null;
}

export function buildApiPreview(
  payload: unknown,
  geoJson: GeoJSON.Feature | GeoJSON.FeatureCollection | null
): string[] {
  const preview: string[] = [];
  if (geoJson?.type) preview.push(`GeoJSON Type: ${geoJson.type}`);
  if (geoJson?.type === "FeatureCollection" && Array.isArray(geoJson.features)) {
    preview.push(`Features: ${geoJson.features.length}`);
  }
  if (payload && typeof payload === "object") {
    const keys = Object.keys(payload as Record<string, unknown>).slice(0, 4);
    if (keys.length > 0) preview.push(`Payload Keys: ${keys.join(", ")}`);
  }
  return preview.length > 0 ? preview : ["API responded, but preview is unavailable."];
}
