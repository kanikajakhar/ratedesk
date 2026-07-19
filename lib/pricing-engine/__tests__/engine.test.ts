import { describe, expect, it } from "vitest";
import { runEngine, roundToStep, type EngineInputs } from "@/lib/pricing-engine";

function unit(
  over: Partial<{ sizeLabel: string; count: number; occupied: number; currentRate: number }> = {},
): EngineInputs["unit"] {
  return {
    sizeLabel: "10x10",
    count: 100,
    occupied: 80,
    currentRate: 100,
    ...over,
  };
}

describe("roundToStep", () => {
  it("rounds to the nearest $5", () => {
    expect(roundToStep(102)).toBe(100);
    expect(roundToStep(103)).toBe(105);
    expect(roundToStep(0)).toBe(0);
  });
});

describe("pricing engine", () => {
  it("computes occupancy from occupied/count", () => {
    const out = runEngine({ unit: unit({ occupied: 92, count: 100 }), competitorRates: [100], month: 9 });
    expect(out.occupancy).toBeCloseTo(0.92, 2);
  });

  it("keeps the target on a $5 step away from guardrail boundaries", () => {
    const out = runEngine({ unit: unit({ occupied: 80 }), competitorRates: [100], month: 9 });
    expect(out.target % 5).toBe(0);
  });

  it("pushes at >=95% occupancy", () => {
    const out = runEngine({ unit: unit({ occupied: 96 }), competitorRates: [100], month: 9 });
    expect(out.occupancyAdj).toBe(0.08);
    expect(out.target).toBeGreaterThan(100);
  });

  it("pulls below 45% occupancy", () => {
    const out = runEngine({ unit: unit({ occupied: 30 }), competitorRates: [100], month: 9 });
    expect(out.occupancyAdj).toBe(-0.06);
    expect(out.target).toBeLessThan(100);
  });

  it("blends competitor gap, dampened and clamped to +7%", () => {
    // competitors 30% above -> raw gap 0.30, dampened 0.15, clamped to 0.07
    const out = runEngine({ unit: unit({ currentRate: 100, occupied: 70 }), competitorRates: [130], month: 9 });
    expect(out.competitorAdj).toBeCloseTo(0.07, 4);
  });

  it("respects the +15% guardrail ceiling", () => {
    // occ 0.99 (+.08) + comp +7% + peak season 1.10 -> raw ~1.265, clamps to 115
    const out = runEngine({ unit: unit({ currentRate: 100, occupied: 99 }), competitorRates: [130], month: 7 });
    expect(out.target).toBeLessThanOrEqual(115);
  });

  it("respects the -15% guardrail floor", () => {
    // occ 0.20 (-.06) + comp clamped to -5% + low season 0.94 -> raw ~0.837, clamps to 85
    const out = runEngine({ unit: unit({ currentRate: 100, occupied: 20 }), competitorRates: [80], month: 1 });
    expect(out.target).toBeGreaterThanOrEqual(85);
  });

  it("treats missing competitor data as neutral", () => {
    const out = runEngine({ unit: unit({ currentRate: 100, occupied: 70 }), competitorRates: [], month: 9 });
    expect(out.competitorAvg).toBe(0);
    expect(out.competitorGap).toBe(0);
    expect(out.competitorAdj).toBe(0);
  });

  it("is deterministic — same inputs, same output", () => {
    const args = { unit: unit({ occupied: 88, currentRate: 119 }), competitorRates: [129, 135], month: 7 };
    expect(runEngine(args)).toEqual(runEngine(args));
  });
});
