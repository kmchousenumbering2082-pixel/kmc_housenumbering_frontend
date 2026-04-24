import type { ReactNode, RefObject } from "react";

import { BASE_LAYER_TILES, type LayerKey, type ToolKey } from "@/components/kmc/constants";
import { IconAnalytics, IconBuilding, IconMap, IconRoad, IconTarget } from "@/components/kmc/icons";

type MapShellProps = {
  mapRef: RefObject<HTMLDivElement | null>;
  activeTool: ToolKey;
  activeLayer: LayerKey;
  lastLocatedLabel: string;
  onToolChange: (tool: ToolKey) => void;
  onLayerChange: (layer: LayerKey) => void;
};

const tools: Array<{ key: ToolKey; label: string; icon: ReactNode }> = [
  { key: "map", label: "Map", icon: <IconMap className="h-4 w-4 fill-current" /> },
  { key: "analytics", label: "Visualization", icon: <IconAnalytics className="h-4 w-4 fill-current" /> },
  { key: "house", label: "House Layer", icon: <IconBuilding className="h-4 w-4 fill-current" /> },
  { key: "road", label: "Road Layer", icon: <IconRoad className="h-4 w-4 fill-current" /> },
];

export function MapShell({
  mapRef,
  activeTool,
  activeLayer,
  lastLocatedLabel,
  onToolChange,
  onLayerChange,
}: MapShellProps) {
  return (
    <section className="grid min-h-0 flex-1 grid-cols-[44px_1fr_200px] gap-2 max-[1200px]:grid-cols-[44px_1fr]">
      <aside className="flex flex-col gap-1.5 rounded-xl border border-blue-100 bg-white p-1.5">
        {tools.map((tool) => (
          <button
            key={tool.key}
            type="button"
            title={tool.label}
            onClick={() => onToolChange(tool.key)}
            className={`grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border text-blue-900 ${
              activeTool === tool.key ? "border-blue-300 bg-blue-100 text-blue-700" : "border-slate-200 bg-white"
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </aside>

      <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-white">
        <div id="map" ref={mapRef} className="h-full w-full" />
        <div className="absolute bottom-2.5 left-2.5 z-[620] flex max-w-[calc(100%-20px)] items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-200">
          <IconTarget className="h-3.5 w-3.5 shrink-0 fill-current" />
          <span>{lastLocatedLabel}</span>
        </div>
      </div>

      <aside className="flex flex-col gap-2.5 rounded-xl border border-blue-100 bg-zinc-200 p-2.5 max-[1200px]:col-span-2 max-[1200px]:grid max-[1200px]:grid-cols-5 max-[1200px]:items-center">
        <h4 className="text-sm font-bold text-zinc-700 max-[1200px]:col-span-5">Base Layers</h4>
        {BASE_LAYER_TILES.map((layer) => (
          <button
            key={layer.key}
            type="button"
            onClick={() => onLayerChange(layer.key)}
            style={{ backgroundImage: `url(${layer.previewUrl})` }}
            className={`flex h-[58px] cursor-pointer items-start overflow-hidden rounded-lg border-2 border-transparent bg-cover bg-center p-1.5 text-left ${
              activeLayer === layer.key ? "border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.35)]" : ""
            }`}
          >
            <span className="rounded-sm bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-700 backdrop-blur-xs">{layer.label}</span>
          </button>
        ))}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-2 max-[1200px]:col-span-5">
          <h5 className="mb-1 text-[11px] font-semibold text-blue-800">Experience Boost</h5>
          <p className="text-[10px] leading-[1.35] text-slate-600">
            Use draw tools to mark field updates and validate addresses with live geocoder results.
          </p>
        </div>
      </aside>
    </section>
  );
}
