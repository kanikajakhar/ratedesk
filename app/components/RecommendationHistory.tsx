import type { Decision, PriceRecommendation } from "@/lib/data/types";
import { cn, usd } from "@/lib/utils";

const DECIDED_COLOR: Record<Exclude<Decision, "pending">, string> = {
  approved: "text-emerald-400",
  adjusted: "text-amber-300",
  rejected: "text-rose-400",
};

export function RecommendationHistory({ recs }: { recs: PriceRecommendation[] }) {
  const decided = recs
    .filter((r) => r.decision !== "pending")
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""));

  if (decided.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900/30">
      <div className="border-b border-white/5 px-4 py-2 text-[10px] uppercase tracking-wider text-zinc-500">
        Decision History
      </div>
      <div className="divide-y divide-white/5">
        {decided.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 px-4 py-2 text-xs"
          >
            <span
              className={cn(
                "w-16 font-medium",
                DECIDED_COLOR[r.decision as Exclude<Decision, "pending">],
              )}
            >
              {r.decision}
            </span>
            <span className="w-24 text-zinc-300">{r.sizeLabel}</span>
            <span className="nums text-zinc-400">
              {usd(r.currentRate)} → {usd(r.finalPrice ?? r.recommendedPrice)}
            </span>
            <span className="ml-auto text-zinc-600">
              {r.decidedAt
                ? new Date(r.decidedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
