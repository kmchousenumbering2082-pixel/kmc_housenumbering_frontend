import type { StatCard } from "@/components/kmc/constants";

type StatsStripProps = {
  stats: StatCard[];
};

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <section className="grid grid-cols-4 gap-2 max-[1200px]:grid-cols-2">
      {stats.map((item) => (
        <article
          key={item.label}
          className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white p-2 shadow-[0_6px_18px_rgba(2,8,23,0.06)]"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">{item.icon}</div>
          <div>
            <h3 className="text-[11px] font-semibold text-slate-700">{item.label}</h3>
            <p className="text-[15px] font-bold text-blue-900">{item.value}</p>
            <span className="text-[10px] text-slate-500">{item.sub}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
