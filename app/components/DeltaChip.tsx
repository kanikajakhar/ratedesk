import { cn, pct } from "@/lib/utils";

export function DeltaChip({ deltaPct }: { deltaPct: number }) {
  const flat = Math.abs(deltaPct) < 0.0005;
  const up = deltaPct > 0;

  return (
    <span
      className={cn(
        "nums inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold",
        flat
          ? "bg-zinc-500/10 text-zinc-500"
          : up
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-rose-500/10 text-rose-400",
      )}
    >
      {flat ? "—" : `${up ? "▲" : "▼"} ${pct(deltaPct)}`}
    </span>
  );
}
