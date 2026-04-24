import { IconFilter, IconSearch } from "@/components/kmc/icons";

type ToolbarProps = {
  wards: string[];
  activeWard: string;
  searchQuery: string;
  onWardChange: (ward: string) => void;
  onSearchQueryChange: (value: string) => void;
  onLocate: () => void;
};

export function KmcToolbar({
  wards,
  activeWard,
  searchQuery,
  onWardChange,
  onSearchQueryChange,
  onLocate,
}: ToolbarProps) {
  return (
    <section className="grid grid-cols-[220px_1fr] gap-2 max-[1200px]:grid-cols-2 max-[780px]:grid-cols-1">
      <label className="grid grid-cols-[20px_1fr] items-center gap-2 rounded-xl border border-blue-100 bg-white px-2 py-1.5">
        <IconFilter className="h-4 w-4 fill-slate-500" />
        <select
          value={activeWard}
          onChange={(event) => onWardChange(event.target.value)}
          className="bg-transparent text-xs outline-none"
        >
          {wards.map((ward) => (
            <option key={ward}>{ward}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-[20px_1fr_auto] items-center gap-2 rounded-xl border border-blue-100 bg-white px-2 py-1.5">
        <IconSearch className="h-4 w-4 fill-slate-500" />
        <input
          type="text"
          placeholder="Search by house no, owner name, place..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onLocate();
          }}
          className="text-sm outline-none"
        />
        <button
          type="button"
          onClick={onLocate}
          className="h-[30px] cursor-pointer rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white"
        >
          Locate
        </button>
      </div>
    </section>
  );
}
