import Link from "next/link";
import { dataSource } from "@/lib/data/source";

export default function Home() {
  const stores = dataSource.listStores();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          RateDesk
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100">
          Self-Storage Pricing Console
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Engine proposes. Claude explains. You decide.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stores.map((s) => {
          const units = dataSource.getUnits(s.id);
          const totalOcc = units.length
            ? units.reduce((a, u) => a + u.occupied, 0) /
              units.reduce((a, u) => a + u.count, 0)
            : 0;
          return (
            <Link
              key={s.id}
              href={`/desk/${s.id}`}
              className="group rounded-lg border border-white/10 bg-zinc-900/40 p-4 transition-colors hover:border-white/20 hover:bg-zinc-900/70"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-100">{s.name}</div>
                <div className="text-zinc-600 transition-colors group-hover:text-zinc-300">
                  →
                </div>
              </div>
              <div className="mt-0.5 text-xs text-zinc-500">
                {s.market} · {s.region}
              </div>
              <div className="nums mt-3 flex items-center gap-4 text-xs text-zinc-400">
                <span>{units.length} unit types</span>
                <span>{Math.round(totalOcc * 100)}% occ</span>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-12 text-xs text-zinc-600">
        Synthetic demo data — not real facilities or rates.
      </footer>
    </main>
  );
}
