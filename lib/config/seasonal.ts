// US self-storage demand seasonality: summer = peak (moves), winter = trough.
// Factor multiplies the raw price. Indexed by calendar month (1–12).
export const SEASONAL_INDEX: Record<number, number> = {
  1: 0.94,
  2: 0.93,
  3: 0.98,
  4: 1.03,
  5: 1.08,
  6: 1.1,
  7: 1.1,
  8: 1.06,
  9: 1.0,
  10: 0.98,
  11: 0.95,
  12: 0.92,
};

/** Seasonal multiplier for a month. Accepts 1–12 (wraps any integer). Defaults to 1.0. */
export function seasonalIndex(month: number): number {
  const m = ((((Math.round(month) - 1) % 12) + 12) % 12) + 1; // normalize to 1..12
  return SEASONAL_INDEX[m] ?? 1;
}
