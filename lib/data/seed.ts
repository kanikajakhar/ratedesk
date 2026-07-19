// ⚠️  SYNTHETIC — DEMO ONLY. Not real facilities, not real rates.
// 8 stores across US markets. Occupancy is deliberately spread across every
// engine tier (0.40 → 0.97) so each store's desk shows pushes AND pulls.
import type { CompetitorSnapshot, Store, StoreUnit } from "./types";

const CAPTURED = "2026-07-01"; // SYNTHETIC

interface UnitSpec {
  sizeLabel: string;
  sqft: number;
  count: number;
  occupied: number;
  currentRate: number;
}
interface CompetitorSpec {
  competitor: string;
  sizeLabel: string;
  rate: number;
  promoText: string;
}
interface StoreSpec {
  id: string;
  name: string;
  market: string;
  region: string;
  openedAt: string;
  units: UnitSpec[];
  competitors: CompetitorSpec[];
}

const SPECS: StoreSpec[] = [
  {
    id: "dfw-las-colinas",
    name: "Las Colinas Storage",
    market: "Dallas – Las Colinas",
    region: "TX",
    openedAt: "2024-09-01",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 40, occupied: 38, currentRate: 49 },
      { sizeLabel: "5x10", sqft: 50, count: 60, occupied: 53, currentRate: 79 },
      { sizeLabel: "10x10", sqft: 100, count: 80, occupied: 58, currentRate: 119 },
      { sizeLabel: "10x20", sqft: 200, count: 50, occupied: 20, currentRate: 189 },
    ],
    competitors: [
      { competitor: "Public Storage", sizeLabel: "10x10", rate: 129, promoText: "1st month $1" },
      { competitor: "Extra Space", sizeLabel: "10x10", rate: 135, promoText: "50% off first month" },
    ],
  },
  {
    id: "phx-desert-sky",
    name: "Desert Sky Storage",
    market: "Phoenix – West Valley",
    region: "AZ",
    openedAt: "2025-01-15",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 30, occupied: 12, currentRate: 44 },
      { sizeLabel: "5x10", sqft: 50, count: 50, occupied: 45, currentRate: 74 },
      { sizeLabel: "10x10", sqft: 100, count: 70, occupied: 66, currentRate: 124 },
      { sizeLabel: "10x20", sqft: 200, count: 40, occupied: 38, currentRate: 199 },
    ],
    competitors: [
      { competitor: "CubeSmart", sizeLabel: "10x10", rate: 119, promoText: "Web special — internet only" },
      { competitor: "Life Storage", sizeLabel: "10x10", rate: 130, promoText: "1 month free on 10x10" },
    ],
  },
  {
    id: "atl-peachtree",
    name: "Peachtree Self Storage",
    market: "Atlanta – North",
    region: "GA",
    openedAt: "2025-03-10",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 35, occupied: 21, currentRate: 45 },
      { sizeLabel: "5x10", sqft: 50, count: 55, occupied: 44, currentRate: 69 },
      { sizeLabel: "10x10", sqft: 100, count: 75, occupied: 60, currentRate: 109 },
      { sizeLabel: "10x20", sqft: 200, count: 45, occupied: 27, currentRate: 175 },
    ],
    competitors: [
      { competitor: "Public Storage", sizeLabel: "10x10", rate: 115, promoText: "20% off first 3 months" },
      { competitor: "Extra Space", sizeLabel: "10x10", rate: 104, promoText: "Internet price — book online" },
    ],
  },
  {
    id: "den-mile-high",
    name: "Mile High Storage",
    market: "Denver – Aurora",
    region: "CO",
    openedAt: "2024-11-20",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 40, occupied: 39, currentRate: 54 },
      { sizeLabel: "5x10", sqft: 50, count: 60, occupied: 57, currentRate: 89 },
      { sizeLabel: "10x10", sqft: 100, count: 90, occupied: 84, currentRate: 134 },
      { sizeLabel: "10x20", sqft: 200, count: 55, occupied: 30, currentRate: 209 },
    ],
    competitors: [
      { competitor: "Storage King USA", sizeLabel: "10x10", rate: 139, promoText: "Limited units at this rate" },
      { competitor: "CubeSmart", sizeLabel: "10x10", rate: 129, promoText: "$29 first month" },
    ],
  },
  {
    id: "tampa-gulf-coast",
    name: "Gulf Coast Storage",
    market: "Tampa – Brandon",
    region: "FL",
    openedAt: "2025-05-01",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 30, occupied: 14, currentRate: 42 },
      { sizeLabel: "5x10", sqft: 50, count: 45, occupied: 20, currentRate: 64 },
      { sizeLabel: "10x10", sqft: 100, count: 65, occupied: 32, currentRate: 99 },
      { sizeLabel: "10x20", sqft: 200, count: 40, occupied: 38, currentRate: 184 },
    ],
    competitors: [
      { competitor: "Extra Space", sizeLabel: "10x10", rate: 109, promoText: "Hurricane-prep storage special" },
      { competitor: "Public Storage", sizeLabel: "10x10", rate: 95, promoText: "Half off first month" },
    ],
  },
  {
    id: "aus-lone-star",
    name: "Lone Star Storage",
    market: "Austin – Round Rock",
    region: "TX",
    openedAt: "2025-02-18",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 35, occupied: 33, currentRate: 47 },
      { sizeLabel: "5x10", sqft: 50, count: 55, occupied: 50, currentRate: 76 },
      { sizeLabel: "10x10", sqft: 100, count: 80, occupied: 76, currentRate: 129 },
      { sizeLabel: "10x20 climate", sqft: 200, count: 45, occupied: 41, currentRate: 219 },
    ],
    competitors: [
      { competitor: "CubeSmart", sizeLabel: "10x10", rate: 125, promoText: "First month free" },
      { competitor: "Life Storage", sizeLabel: "10x10", rate: 132, promoText: "Web-only deal" },
    ],
  },
  {
    id: "nas-music-city",
    name: "Music City Storage",
    market: "Nashville – Antioch",
    region: "TN",
    openedAt: "2025-04-05",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 30, occupied: 18, currentRate: 43 },
      { sizeLabel: "5x10", sqft: 50, count: 50, occupied: 38, currentRate: 72 },
      { sizeLabel: "10x10", sqft: 100, count: 70, occupied: 49, currentRate: 114 },
      { sizeLabel: "10x20", sqft: 200, count: 45, occupied: 25, currentRate: 179 },
    ],
    competitors: [
      { competitor: "Public Storage", sizeLabel: "10x10", rate: 119, promoText: "$19 move-in special" },
      { competitor: "Extra Space", sizeLabel: "10x10", rate: 110, promoText: "Online discount applied" },
    ],
  },
  {
    id: "scb-camelback",
    name: "Camelback Storage",
    market: "Scottsdale – Old Town",
    region: "AZ",
    openedAt: "2024-10-12",
    units: [
      { sizeLabel: "5x5", sqft: 25, count: 32, occupied: 31, currentRate: 52 },
      { sizeLabel: "5x10", sqft: 50, count: 52, occupied: 49, currentRate: 86 },
      { sizeLabel: "10x10 climate", sqft: 100, count: 78, occupied: 73, currentRate: 139 },
      { sizeLabel: "10x20 climate", sqft: 200, count: 42, occupied: 22, currentRate: 229 },
    ],
    competitors: [
      { competitor: "Devon Self Storage", sizeLabel: "10x10", rate: 145, promoText: "Premium climate-controlled" },
      { competitor: "CubeSmart", sizeLabel: "10x10", rate: 134, promoText: "Summer move-in special" },
    ],
  },
];

export const STORES: Store[] = SPECS.map(({ id, name, market, region, openedAt }) => ({
  id,
  name,
  market,
  region,
  openedAt,
}));

export const UNITS: StoreUnit[] = SPECS.flatMap((s) =>
  s.units.map((u) => ({ storeId: s.id, ...u })),
);

export const COMPETITORS: CompetitorSnapshot[] = SPECS.flatMap((s) =>
  s.competitors.map((c) => ({ storeId: s.id, capturedAt: CAPTURED, ...c })),
);
