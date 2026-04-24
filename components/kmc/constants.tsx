import type { ReactNode } from "react";

import { IconHouse, IconRoute, IconSearch, IconWard } from "@/components/kmc/icons";

export type LayerKey = "osm" | "hot" | "satellite" | "hybrid" | "bing";
export type ToolKey = "map" | "analytics" | "house" | "road";

export const WARDS = [
  "All Wards",
  "Ward 1",
  "Ward 2",
  "Ward 3",
  "Ward 4",
  "Ward 5",
  "Ward 6",
  "Ward 7",
  "Ward 8",
  "Ward 9",
  "Ward 10",
  "Ward 11",
  "Ward 12",
  "Ward 13",
  "Ward 14",
  "Ward 15",
  "Ward 16",
  "Ward 17",
  "Ward 18",
  "Ward 19",
  "Ward 20",
  "Ward 21",
  "Ward 22",
  "Ward 23",
  "Ward 24",
  "Ward 25",
  "Ward 26",
  "Ward 27",
  "Ward 28",
  "Ward 29",
  "Ward 30",
  "Ward 31",
  "Ward 32",
];

export const BASE_LAYER_TILES: Array<{ key: LayerKey; label: string; previewUrl: string }> = [
  { key: "hot", label: "Drone Ortho", previewUrl: "https://tile.openstreetmap.fr/hot/16/53714/24590.png" },
  { key: "osm", label: "OpenStreetMap", previewUrl: "https://tile.openstreetmap.org/16/53714/24590.png" },
  { key: "hybrid", label: "Google Hybrid", previewUrl: "https://mt1.google.com/vt/lyrs=s&x=26857&y=12295&z=15" },
  { key: "bing", label: "Bing", previewUrl: "https://tile.opentopomap.org/15/26857/12295.png" },
];

export type StatCard = {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
};

export const QUICK_STATS: StatCard[] = [
  { label: "Metropolitan Wards", value: "32", sub: "Administrative Wards", icon: <IconWard className="h-4 w-4 fill-current" /> },
  { label: "Mapped Houses", value: "124K+", sub: "Addressed Structures", icon: <IconHouse className="h-4 w-4 fill-current" /> },
  { label: "Survey Routes", value: "540+", sub: "Verified Field Routes", icon: <IconRoute className="h-4 w-4 fill-current" /> },
  { label: "Search Accuracy", value: "High", sub: "Geo + Text Match", icon: <IconSearch className="h-4 w-4 fill-current" /> },
];
