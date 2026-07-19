import type { Confidence } from "@/lib/data/types";

export interface AdvisorResult {
  recommendedPrice: number;
  confidence: Confidence;
  rationale: string[]; // exactly 3 bullets
  keyDrivers: string[];
  riskNote: string | null;
}
