import { seasonalIndex } from "@/lib/config/seasonal";
import type { StoreUnit } from "@/lib/data/types";

// ── Deterministic pricing engine ────────────────────────────────────────────
// Pure. No I/O. The single source of truth for the target price.
// The LLM NEVER computes this number — it only refines within the guardrail
// band and writes the explanation. See MASTER_PRD.md §4.

const STEP = 5; // round targets to nearest $5
const GUARDRAIL = 0.15; // never move more than ±15% from current

export interface EngineInputs {
  unit: Pick<StoreUnit, "sizeLabel" | "count" | "occupied" | "currentRate">;
  competitorRates: number[];
  month: number; // 1–12
}

export interface EngineOutput {
  sizeLabel: string;
  occupancy: number; // 0..1
  competitorAvg: number; // 0 when no competitor data
  competitorGap: number; // fraction; 0 when no data
  season: number;
  occupancyAdj: number;
  competitorAdj: number;
  raw: number;
  target: number; // final, on-step, within guardrail
  band: { lo: number; hi: number };
}

export function roundToStep(value: number, step = STEP): number {
  return Math.round(value / step) * step;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

function occupancyAdjustment(occ: number): number {
  if (occ >= 0.95) return 0.08;
  if (occ >= 0.9) return 0.05;
  if (occ >= 0.8) return 0.02;
  if (occ >= 0.6) return 0.0;
  if (occ >= 0.45) return -0.03;
  return -0.06;
}

export function runEngine(input: EngineInputs): EngineOutput {
  const { unit, competitorRates, month } = input;

  const occupancy = unit.count > 0 ? unit.occupied / unit.count : 0;

  const hasComps = competitorRates.length > 0;
  const competitorAvg = hasComps
    ? competitorRates.reduce((sum, r) => sum + r, 0) / competitorRates.length
    : 0;
  const competitorGap =
    hasComps && unit.currentRate > 0
      ? (competitorAvg - unit.currentRate) / unit.currentRate
      : 0;

  const season = seasonalIndex(month);
  const occupancyAdj = occupancyAdjustment(occupancy);
  const competitorAdj = clamp(competitorGap * 0.5, -0.05, 0.07);

  const raw = unit.currentRate * (1 + occupancyAdj + competitorAdj) * season;

  const lo = unit.currentRate * (1 - GUARDRAIL);
  const hi = unit.currentRate * (1 + GUARDRAIL);
  const target = clamp(roundToStep(raw), lo, hi);

  return {
    sizeLabel: unit.sizeLabel,
    occupancy,
    competitorAvg,
    competitorGap,
    season,
    occupancyAdj,
    competitorAdj,
    raw,
    target,
    band: { lo, hi },
  };
}
