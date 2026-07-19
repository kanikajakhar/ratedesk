"use client";

import { useState } from "react";
import type { Decision, PriceRecommendation } from "@/lib/data/types";
import { cn, usd } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { DeltaChip } from "./DeltaChip";
import { OccupancyBar } from "./OccupancyBar";
import { RationalePanel } from "./RationalePanel";
import { Button } from "./ui/Button";

const DECIDED_COLOR: Record<Exclude<Decision, "pending">, string> = {
  approved: "text-emerald-400",
  adjusted: "text-amber-300",
  rejected: "text-rose-400",
};

export function UnitPriceRow({
  rec,
  expanded,
  onToggle,
  onDecide,
  disabled,
}: {
  rec: PriceRecommendation;
  expanded: boolean;
  onToggle: () => void;
  onDecide: (
    id: string,
    decision: Exclude<Decision, "pending">,
    finalPrice?: number,
  ) => void;
  disabled: boolean;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const [draft, setDraft] = useState(rec.recommendedPrice);
  const decided = rec.decision !== "pending";

  return (
    <div className={cn("transition-colors", expanded && "bg-white/[0.02]")}>
      <div className="flex items-center gap-4 px-4 py-2.5">
        <button onClick={onToggle} className="w-28 text-left">
          <div className="text-sm font-semibold text-zinc-100">{rec.sizeLabel}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">
            {decided ? rec.decision : "pending"}
          </div>
        </button>

        <div className="nums flex w-44 items-baseline gap-2">
          <span className="text-sm text-zinc-500 line-through">
            {usd(rec.currentRate)}
          </span>
          <span className="text-zinc-600">→</span>
          <span className="text-base font-semibold text-zinc-100">
            {usd(rec.recommendedPrice)}
          </span>
        </div>

        <div className="w-20">
          <DeltaChip deltaPct={rec.deltaPct} />
        </div>
        <div className="w-28">
          <OccupancyBar value={rec.occupancy} />
        </div>
        <div className="w-16">
          <ConfidenceBadge confidence={rec.confidence} />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          {!decided && !adjusting && (
            <>
              <Button
                variant="approve"
                disabled={disabled}
                onClick={() => onDecide(rec.id, "approved", rec.recommendedPrice)}
              >
                Approve
              </Button>
              <Button
                variant="adjust"
                disabled={disabled}
                onClick={() => {
                  setDraft(rec.recommendedPrice);
                  setAdjusting(true);
                }}
              >
                Adjust
              </Button>
              <Button
                variant="reject"
                disabled={disabled}
                onClick={() => onDecide(rec.id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}

          {adjusting && (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step={5}
                value={draft}
                onChange={(e) => setDraft(Number(e.target.value))}
                className="nums w-20 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 focus:border-white/30 focus:outline-none"
              />
              <Button
                variant="approve"
                disabled={disabled}
                onClick={() => {
                  onDecide(rec.id, "adjusted", draft);
                  setAdjusting(false);
                }}
              >
                Save
              </Button>
              <Button variant="ghost" disabled={disabled} onClick={() => setAdjusting(false)}>
                Cancel
              </Button>
            </div>
          )}

          {decided && (
            <span
              className={cn(
                "text-xs font-medium",
                DECIDED_COLOR[rec.decision as Exclude<Decision, "pending">],
              )}
            >
              {rec.decision === "adjusted"
                ? `Set ${usd(rec.finalPrice ?? rec.recommendedPrice)}`
                : rec.decision}
            </span>
          )}
        </div>
      </div>

      {expanded && <RationalePanel rec={rec} />}
    </div>
  );
}
