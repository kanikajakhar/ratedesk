import type { PricingDataSource } from "./source";

// ── Supabase adapter — STUB. Not used in v1 (LocalDataSource is active). ────
//
// To go live:
//   1. npm i @supabase/supabase-js
//   2. Create tables: stores, store_units, competitor_snapshots, price_recommendations
//   3. Implement each method below against supabase.from("<table>").select/insert/update
//   4. In ./source.ts, swap:  export const dataSource = new SupabaseDataSource();

const NOT_IMPLEMENTED =
  "SupabaseDataSource is not implemented in v1. See lib/data/supabase.ts.";

const neverThrow = (): never => {
  throw new Error(NOT_IMPLEMENTED);
};

export class SupabaseDataSource implements PricingDataSource {
  listStores = neverThrow;
  getStore = neverThrow;
  getUnits = neverThrow;
  getCompetitors = neverThrow;
  saveRecommendation = neverThrow;
  clearPending = neverThrow;
  listRecommendations = neverThrow;
  updateRecommendation = neverThrow;
}
