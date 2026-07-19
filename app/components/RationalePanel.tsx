import type { PriceRecommendation } from "@/lib/data/types";
import { usd } from "@/lib/utils";

export function RationalePanel({ rec }: { rec: PriceRecommendation }) {
  return (
    <div className="grid grid-cols-1 gap-6 px-4 pb-4 pl-28 pt-1 text-xs md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
          Rationale
        </div>
        <ul className="space-y-1">
          {rec.rationale.length === 0 && (
            <li className="text-zinc-600 italic">No rationale available.</li>
          )}
          {rec.rationale.map((bullet, i) => (
            <li key={i} className="leading-relaxed text-zinc-300">
              {bullet}
            </li>
          ))}
        </ul>
        {rec.riskNote && (
          <div className="mt-2 flex items-start gap-1.5 text-amber-300/90">
            <span>⚠</span>
            <span>{rec.riskNote}</span>
          </div>
        )}
        {rec.keyDrivers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {rec.keyDrivers.map((d, i) => (
              <span
                key={i}
                className="nums rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
          Engine
        </div>
        <div className="nums space-y-0.5 text-zinc-400">
          <Row label="Engine target" value={usd(rec.engineTarget)} valueClass="text-zinc-200" />
          <Row
            label="Comp avg"
            value={rec.competitorAvg > 0 ? usd(rec.competitorAvg) : "—"}
          />
          <Row label="Guardrail" value={`${usd(rec.bandLo)}–${usd(rec.bandHi)}`} />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
