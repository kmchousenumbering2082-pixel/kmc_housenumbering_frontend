"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="map-canvas flex items-center justify-center bg-gray-200">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

type LayerKey = "osm" | "hot" | "satellite" | "hybrid" | "bing";

const WARDS = [
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

function IconHouse() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9Z" />
    </svg>
  );
}

function IconWard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 3.2 5 1.9V11c0 3.7-2.2 7.2-5 8.5-2.8-1.3-5-4.8-5-8.5V7.1l5-1.9Z" />
    </svg>
  );
}

function IconRoute() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM8.5 8H12v2H8.5V8Zm5 0H16V6h-2.5v2Zm-2 4H14v-2h-2.5v2Zm3 4H16v-2h-1.5v2Zm-6 2H12v-2H8.5v2Z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 3a7.5 7.5 0 1 0 4.7 13.3l4.2 4.2 1.4-1.4-4.2-4.2A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v2l-6 7v4l-4 2v-6L4 7V5Z" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3Zm7 1-6 6V7h-2v6h6v-2h-3l6-6-1-1Z" />
    </svg>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWard, setActiveWard] = useState("All Wards");
  const [activeLayer, setActiveLayer] = useState<LayerKey>("osm");

  const [lastLocatedLabel, setLastLocatedLabel] = useState("No location selected");

  const quickStats = useMemo(
    () => [
      { label: "Metropolitan Wards", value: "32", sub: "Administrative Wards", icon: <IconWard /> },
      { label: "Mapped Houses", value: "124K+", sub: "Addressed Structures", icon: <IconHouse /> },
      { label: "Survey Routes", value: "540+", sub: "Verified Field Routes", icon: <IconRoute /> },
      { label: "Search Accuracy", value: "High", sub: "Geo + Text Match", icon: <IconSearch /> },
    ],
    []
  );

  const searchAndLocate = async () => {
    // Search functionality will be integrated with MapComponent
    console.log("Search triggered:", searchQuery);
  };



  return (
    <main className="kmc-shell">
      <header className="top-header">
        <div className="brand-block">
          <img src="/media/Nepal.png" alt="Nepal logo" className="logo" />
          <div className="logo-divider" />
          <img src="/media/KMC.png" alt="KMC logo" className="logo" />
        </div>

        <div className="title-block">
          <h1>काठमाडौं महानगरपालिका</h1>
          <h2>Kathmandu Metropolitan City</h2>
          <p>Digital House Numbering and Address Intelligence Platform</p>
        </div>

        <img src="/media/Nepal_flag.png" alt="Nepal flag" className="flag-logo" />
      </header>

      <section className="stats-strip">
        {quickStats.map((item) => (
          <article key={item.label} className="stat-card">
            <div className="stat-icon">{item.icon}</div>
            <div>
              <h3>{item.label}</h3>
              <p>{item.value}</p>
              <span>{item.sub}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="toolbar-row">
        <div className="toolbar-search">
          <IconSearch />
          <button type="button" onClick={searchAndLocate}>
            Locate
          </button>
          <input
            type="text"
            placeholder="Search by house no, owner name, place, plus code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchAndLocate();
            }}
          />
        </div>

        <label className="ward-filter">
          <IconFilter />
          <select value={activeWard} onChange={(e) => setActiveWard(e.target.value)}>
            {WARDS.map((ward) => (
              <option key={ward}>{ward}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="map-shell">
        <aside className="left-tools">
          <button type="button" title="Map">
            🗺️
          </button>
          <button type="button" title="Visualization">
            📊
          </button>
          <button type="button" title="House Layer">
            🏠
          </button>
          <button type="button" title="Road Layer">
            🛣️
          </button>
        </aside>

        <div className="map-canvas-wrap">
          <div className="map-search-top-right" role="search">
            <input
              type="text"
              placeholder="Search by house no, owner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchAndLocate();
              }}
            />
            <button type="button" onClick={searchAndLocate}>
              Search
            </button>
          </div>
          <MapComponent activeLayer={activeLayer} searchQuery={searchQuery} activeWard={activeWard} onLocationUpdate={setLastLocatedLabel} />
          <div className="status-pill">
            <IconTarget />
            <span>{lastLocatedLabel}</span>
          </div>
        </div>

        <aside className="layer-panel">
          <h4>Base Layers</h4>
          <button type="button" className={activeLayer === "hot" ? "active" : ""} onClick={() => setActiveLayer("hot")}>
            Drone Ortho
          </button>
          <button type="button" className={activeLayer === "osm" ? "active" : ""} onClick={() => setActiveLayer("osm")}>
            OSM
          </button>
          <button
            type="button"
            className={activeLayer === "satellite" ? "active" : ""}
            onClick={() => setActiveLayer("satellite")}
          >
            Satellite
          </button>
          <button
            type="button"
            className={activeLayer === "hybrid" ? "active" : ""}
            onClick={() => setActiveLayer("hybrid")}
          >
            Hybrid
          </button>
          <button type="button" className={activeLayer === "bing" ? "active" : ""} onClick={() => setActiveLayer("bing")}>
            Bing
          </button>
        </aside>
      </section>

      <style jsx>{`
        :global(html, body) {
          margin: 0;
          width: 100%;
          height: 100%;
          background: #eef3fa;
          color: #0f172a;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }
        :global(body > div:first-child) {
          height: 100%;
        }
        .kmc-shell {
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          box-sizing: border-box;
          background: #f5f8fd;
        }
        .top-header {
          min-height: 84px;
          border-radius: 12px;
          background: linear-gradient(125deg, #0b3f8f, #1e56a0 58%, #3d78c5);
          display: grid;
          grid-template-columns: 128px 1fr 30px;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          color: #fff;
        }
        .brand-block {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo {
          width: 34px;
          height: 34px;
          object-fit: contain;
          background: #fff;
          border-radius: 8px;
          padding: 4px 6px;
        }
        .logo-divider {
          width: 2px;
          height: 26px;
          border-radius: 2px;
          background: rgba(210, 218, 231, 0.95);
        }
        .title-block {
          text-align: center;
          line-height: 1.2;
        }
        .title-block h1,
        .title-block h2,
        .title-block p {
          margin: 0;
        }
        .title-block h1 {
          font-size: 1rem;
          font-weight: 700;
        }
        .title-block h2 {
          margin-top: 2px;
          font-size: 0.73rem;
          font-weight: 600;
        }
        .title-block p {
          margin-top: 2px;
          font-size: 0.66rem;
          opacity: 0.92;
        }
        .flag-logo {
          width: 34px;
          height: 34px;
          object-fit: contain;
          justify-self: end;
        }
        .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(130px, 1fr));
          gap: 6px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #d9e4f4;
          border-radius: 10px;
          padding: 6px;
        }
        .stat-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #e8f0fe;
          color: #1d4ed8;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .stat-icon :global(svg) {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        .stat-card h3,
        .stat-card p,
        .stat-card span {
          margin: 0;
        }
        .stat-card h3 {
          font-size: 0.72rem;
          color: #334155;
          font-weight: 600;
        }
        .stat-card p {
          margin-top: 1px;
          font-size: 0.96rem;
          color: #0b3f8f;
          font-weight: 700;
        }
        .stat-card span {
          font-size: 0.66rem;
          color: #64748b;
        }
        .toolbar-row {
          display: none;
        }
        .toolbar-search {
          display: grid;
          grid-template-columns: 20px auto 1fr;
          align-items: center;
          gap: 8px;
          border-radius: 10px;
          border: 1px solid #d9e4f4;
          background: #fff;
          padding: 6px 8px;
        }
        .toolbar-search :global(svg) {
          width: 16px;
          height: 16px;
          fill: #64748b;
        }
        .toolbar-search input {
          border: none;
          outline: none;
          font-size: 0.83rem;
        }
        .toolbar-search button {
          border: none;
          background: #1d4ed8;
          color: #fff;
          border-radius: 8px;
          height: 30px;
          padding: 0 12px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .ward-filter {
          display: grid;
          grid-template-columns: 20px 1fr;
          align-items: center;
          gap: 8px;
          border-radius: 10px;
          border: 1px solid #d9e4f4;
          background: #fff;
          padding: 6px 8px;
        }
        .ward-filter :global(svg) {
          width: 16px;
          height: 16px;
          fill: #64748b;
        }
        .ward-filter select {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.82rem;
        }
        .map-shell {
          min-height: 0;
          flex: 1;
          display: grid;
          grid-template-columns: 44px 1fr 200px;
          gap: 8px;
        }
        .left-tools {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #d9e4f4;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 6px;
        }
        .left-tools button {
          width: 30px;
          height: 30px;
          border: 1px solid #d8e2f1;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 15px;
        }
        .map-canvas-wrap {
          position: relative;
          border: 1px solid #d9e4f4;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .map-search-top-right {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 650;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 6px;
          width: min(360px, calc(100% - 20px));
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #d6e0ef;
          border-radius: 8px;
          padding: 6px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .map-search-top-right input {
          border: 1px solid #d0d9e8;
          border-radius: 6px;
          height: 30px;
          padding: 0 9px;
          outline: none;
          font-size: 0.78rem;
        }
        .map-search-top-right button {
          border: none;
          border-radius: 6px;
          height: 30px;
          padding: 0 10px;
          background: #1d4ed8;
          color: #fff;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
        }
        .map-canvas {
          width: 100%;
          height: 100%;
        }
        .status-pill {
          position: absolute;
          left: 10px;
          bottom: 10px;
          z-index: 620;
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: min(540px, calc(100% - 20px));
          background: rgba(15, 23, 42, 0.82);
          color: #e2e8f0;
          border-radius: 8px;
          padding: 7px 9px;
          font-size: 0.73rem;
        }
        .status-pill :global(svg) {
          width: 14px;
          height: 14px;
          fill: currentColor;
          flex-shrink: 0;
        }
        .layer-panel {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #d9e4f4;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .layer-panel h4 {
          margin: 0 0 2px;
          font-size: 0.84rem;
          color: #1d4d9f;
        }
        .layer-panel button {
          height: 30px;
          border: 1px solid #d4ddec;
          background: #f8fbff;
          border-radius: 8px;
          text-align: left;
          padding: 0 9px;
          font-size: 0.75rem;
          color: #334155;
          cursor: pointer;
        }
        .layer-panel button.active {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1d4ed8;
          font-weight: 700;
        }
        :global(.kmc-map-btn) {
          width: 32px;
          height: 32px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          display: grid;
          place-items: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
        }
        @media (max-width: 1200px) {
          .stats-strip {
            grid-template-columns: repeat(2, minmax(150px, 1fr));
          }
          .map-shell {
            grid-template-columns: 44px 1fr;
          }
          .layer-panel {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            align-items: center;
          }
          .layer-panel h4 {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 780px) {
          .toolbar-row {
            grid-template-columns: 1fr;
          }
          .top-header {
            grid-template-columns: 92px 1fr 26px;
          }
          .title-block h1 {
            font-size: 0.9rem;
          }
          .title-block h2 {
            font-size: 0.66rem;
          }
          .title-block p {
            font-size: 0.58rem;
          }
        }
      `}</style>
    </main>
  );
}
