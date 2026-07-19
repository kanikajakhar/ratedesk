import { cn } from "@/lib/utils";

export function OccupancyBar({ value }: { value: number }) {
  const pctVal = Math.round(value * 100);
  const color =
    value >= 0.9 ? "bg-emerald-500" : value >= 0.6 ? "bg-zinc-400" : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pctVal}%` }}
        />
      </div>
      <span className="nums w-9 text-right text-xs text-zinc-400">{pctVal}%</span>
    </div>
  );
}
