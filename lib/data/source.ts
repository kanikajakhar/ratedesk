import { COMPETITORS, STORES, UNITS } from "./seed";
import type {
  CompetitorSnapshot,
  PriceRecommendation,
  Store,
  StoreUnit,
} from "./types";

// ── Data source interface ───────────────────────────────────────────────────
// v1 runs on the in-memory LocalDataSource below. Swap to SupabaseDataSource
// (see ./supabase.ts) for persistence — no UI or engine changes required.
export interface PricingDataSource {
  listStores(): Store[];
  getStore(id: string): Store | undefined;
  getUnits(storeId: string): StoreUnit[];
  getCompetitors(storeId: string): CompetitorSnapshot[];
  saveRecommendation(rec: PriceRecommendation): void;
  clearPending(storeId: string): void;
  listRecommendations(storeId: string): PriceRecommendation[];
  updateRecommendation(
    id: string,
    patch: Partial<PriceRecommendation>,
  ): PriceRecommendation | undefined;
}

// In-memory recommendation store. v1 demo only — resets on server restart
// or Next.js dev hot-reload. That is intentional for the scaffold.
const recommendations = new Map<string, PriceRecommendation>();

class LocalDataSource implements PricingDataSource {
  listStores(): Store[] {
    return STORES;
  }
  getStore(id: string): Store | undefined {
    return STORES.find((s) => s.id === id);
  }
  getUnits(storeId: string): StoreUnit[] {
    return UNITS.filter((u) => u.storeId === storeId);
  }
  getCompetitors(storeId: string): CompetitorSnapshot[] {
    return COMPETITORS.filter((c) => c.storeId === storeId);
  }
  saveRecommendation(rec: PriceRecommendation): void {
    recommendations.set(rec.id, rec);
  }
  clearPending(storeId: string): void {
    for (const [id, rec] of recommendations) {
      if (rec.storeId === storeId && rec.decision === "pending") {
        recommendations.delete(id);
      }
    }
  }
  listRecommendations(storeId: string): PriceRecommendation[] {
    return [...recommendations.values()]
      .filter((r) => r.storeId === storeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  updateRecommendation(
    id: string,
    patch: Partial<PriceRecommendation>,
  ): PriceRecommendation | undefined {
    const current = recommendations.get(id);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    recommendations.set(id, next);
    return next;
  }
}

export const dataSource: PricingDataSource = new LocalDataSource();
