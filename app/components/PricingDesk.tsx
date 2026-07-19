"use client";

import { useState, useTransition } from "react";
import type { Decision, PriceRecommendation } from "@/lib/data/types";
import { decideRecommendation, runPricing } from "@/app/actions/pricing";
import { RecommendationHistory } from "./RecommendationHistory";
import { UnitPriceRow } from "./UnitPriceRow";
import { Button } from "./ui/Button";

export function PricingDesk({
  storeId,
  initial,
}: {
  storeId: string;
  initial: PriceRecommendation[];
}) {
  const [recs, setRecs] = useState<PriceRecommendation[]>(initial);
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);

  const active = recs.filter((r) => r.decision === "pending");

  function handleRun() {
    startTransition(async () => {
      const next = await runPricing(storeId);
      setRecs(next);
    });
  }

  function handleDecide(
    id: string,
    decision: Exclude<Decision, "pending">,
    finalPrice?: number,
  ) {
    startTransition(async () => {
      const next = await decideRecommendation(storeId, id, decision, finalPrice);
      setRecs(next);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">Pricing Desk</h2>
        <Button onClick={handleRun} disabled={pending}>
          {pending ? "Running…" : "▶ Run Pricing"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900/40">
        {active.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-zinc-500">
            {pending ? (
              "Crunching occupancy, competitor, and seasonal signals…"
            ) : (
              <>
                No active recommendations. Click{" "}
                <span className="text-zinc-300">Run Pricing</span> to generate.
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {active.map((rec) => (
              <UnitPriceRow
                key={rec.id}
                rec={rec}
                expanded={expanded === rec.id}
                onToggle={() => setExpanded(expanded === rec.id ? null : rec.id)}
                onDecide={handleDecide}
                disabled={pending}
              />
            ))}
          </div>
        )}
      </div>

      <RecommendationHistory recs={recs} />
    </div>
  );
}
