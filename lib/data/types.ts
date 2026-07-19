// ── Domain types (source of truth) ──────────────────────────────────────────

export type Confidence = "high" | "medium" | "low";
export type Decision = "pending" | "approved" | "adjusted" | "rejected";

export interface Store {
  id: string;
  name: string;
  market: string;
  region: string;
  openedAt: string;
}

export interface StoreUnit {
  storeId: string;
  sizeLabel: string;
  sqft: number;
  count: number;
  occupied: number;
  currentRate: number; // monthly street rate, USD
}

export interface CompetitorSnapshot {
  storeId: string;
  competitor: string;
  sizeLabel: string;
  rate: number;
  promoText: string; // qualitative signal Claude reasons over
  capturedAt: string;
}

export interface PriceRecommendation {
  id: string;
  storeId: string;
  sizeLabel: string;

  currentRate: number;
  engineTarget: number;
  recommendedPrice: number;
  deltaPct: number;
  confidence: Confidence;

  rationale: string[]; // exactly 3 bullets
  keyDrivers: string[];
  riskNote: string | null;

  // engine transparency (shown in the rationale panel)
  occupancy: number; // 0..1
  competitorAvg: number; // 0 when no competitor data
  bandLo: number;
  bandHi: number;

  decision: Decision;
  finalPrice: number | null;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
}
