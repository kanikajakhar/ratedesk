import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/data/types";

const STYLES: Record<Confidence, string> = {
  high: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  low: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STYLES[confidence],
      )}
    >
      {confidence}
    </span>
  );
}
