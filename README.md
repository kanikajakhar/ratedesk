# RateDesk — Self-Storage Dynamic Pricing Console

A dynamic pricing console for a self-storage operator. Pick a store → run pricing → get a per-unit-size recommendation with a plain-English rationale → **Approve / Adjust / Reject**.

> **Architecture in one line:** a deterministic engine proposes the number; Claude explains and refines it; a human approves it.

---

## Why it's built this way

- **The LLM is never the calculator.** A pure TypeScript engine (`lib/pricing-engine`) computes every target price — testable, auditable, defensible to a finance VP. Claude only refines within a ±15% guardrail and writes the rationale.
- **Human-in-the-loop.** No price ever auto-applies. Every decision is persisted to an audit trail.
- **Data layer is interface-backed.** v1 runs on a synthetic seed; swap in Supabase by implementing one class (`lib/data/supabase.ts`).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The app runs **immediately with no API key** — it uses a deterministic mock advisor derived from the engine output. To get real Claude rationale:

```bash
cp .env.local.example .env.local
# add ANTHROPIC_API_KEY=sk-ant-...
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the engine unit tests (Vitest) |

---

## Project structure

```
lib/
  pricing-engine/      deterministic engine + tests (the source of truth for the number)
  claude-advisor/      Anthropic SDK wrapper + mock fallback (the judgment/narrative layer)
  data/                types, synthetic seed, data-source interface + local impl + supabase stub
  config/seasonal.ts   monthly seasonal index
  utils.ts             cn(), currency/percent helpers
app/
  page.tsx             store list
  desk/[storeId]/      the pricing console
  actions/pricing.ts   runPricing / decideRecommendation (Server Actions)
  components/           trading-desk UI
MASTER_PRD.md          the spec this was built to
```

## Data swap (mock → real)

`lib/data/source.ts` exports a `PricingDataSource` interface and an in-memory `LocalDataSource`. To go live:

1. `npm i @supabase/supabase-js`
2. Create tables: `stores`, `store_units`, `competitor_snapshots`, `price_recommendations`
3. Implement `SupabaseDataSource` (stubbed in `lib/data/supabase.ts`)
4. In `lib/data/source.ts`, swap the export to `new SupabaseDataSource()`

No UI or engine code changes.

---

*All facility data is synthetic and labeled as such. Not real facilities, not real rates.*
