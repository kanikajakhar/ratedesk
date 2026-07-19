"use server";

import { revalidatePath } from "next/cache";
import { advise } from "@/lib/claude-advisor";
import { dataSource } from "@/lib/data/source";
import { runEngine } from "@/lib/pricing-engine";
import type { Decision, PriceRecommendation } from "@/lib/data/types";

function currentMonth(): number {
  return new Date().getMonth() + 1; // 1–12
}

/** Generate fresh recommendations for every unit size at a store. */
export async function runPricing(storeId: string): Promise<PriceRecommendation[]> {
  const store = dataSource.getStore(storeId);
  if (!store) throw new Error(`Store not found: ${storeId}`);

  const units = dataSource.getUnits(storeId);
  const competitors = dataSource.getCompetitors(storeId);
  const month = currentMonth();

  // Replace any still-pending recs so the desk shows one clean row per size.
  dataSource.clearPending(storeId);

  const runId = Date.now();

  for (const unit of units) {
    const comps = competitors.filter((c) => c.sizeLabel === unit.sizeLabel);
    const engine = runEngine({
      unit,
      competitorRates: comps.map((c) => c.rate),
      month,
    });

    const advisor = await advise(engine, {
      currentRate: unit.currentRate,
      competitorPromos: comps.map((c) => `${c.competitor} — ${c.promoText} ($${c.rate})`),
      marketNote: `${store.market} · ${store.region}`,
    });

    const deltaPct =
      (advisor.recommendedPrice - unit.currentRate) / (unit.currentRate || 1);

    const rec: PriceRecommendation = {
      id: `${storeId}-${unit.sizeLabel}-${runId}`,
      storeId,
      sizeLabel: unit.sizeLabel,
      currentRate: unit.currentRate,
      engineTarget: engine.target,
      recommendedPrice: advisor.recommendedPrice,
      deltaPct,
      confidence: advisor.confidence,
      rationale: advisor.rationale,
      keyDrivers: advisor.keyDrivers,
      riskNote: advisor.riskNote,
      occupancy: engine.occupancy,
      competitorAvg: engine.competitorAvg,
      bandLo: engine.band.lo,
      bandHi: engine.band.hi,
      decision: "pending",
      finalPrice: null,
      decidedBy: null,
      decidedAt: null,
      createdAt: new Date().toISOString(),
    };

    dataSource.saveRecommendation(rec);
  }

  revalidatePath(`/desk/${storeId}`);
  return dataSource.listRecommendations(storeId);
}

/** Record a human decision (approve / adjust / reject) and update the audit trail. */
export async function decideRecommendation(
  storeId: string,
  id: string,
  decision: Exclude<Decision, "pending">,
  finalPrice?: number,
): Promise<PriceRecommendation[]> {
  dataSource.updateRecommendation(id, {
    decision,
    finalPrice: finalPrice ?? null,
    decidedBy: "demo@ratedesk",
    decidedAt: new Date().toISOString(),
  });

  revalidatePath(`/desk/${storeId}`);
  return dataSource.listRecommendations(storeId);
}
