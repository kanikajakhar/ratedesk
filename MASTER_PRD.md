# RateDesk — Self-Storage Dynamic Pricing Console

**Master PRD Prompt.** This is the source-of-truth spec. Build to it; do not deviate from the architectural rules.

---

## META — READ FIRST
RateDesk is a dynamic pricing console for a self-storage operator. A revenue manager picks a store, runs pricing, and gets a per-unit-size recommendation with a plain-English rationale, then Approves / Adjusts / Rejects.

**Non-negotiable architectural rules:**
1. **The LLM is never the calculator.** A deterministic TypeScript `pricing-engine` computes every target price. Claude only refines within a band and writes the explanation.
2. **Human-in-the-loop.** No auto-applied prices. Every change passes through Approve/Adjust/Reject and is persisted to an audit trail.
3. **Data layer is interface-backed.** v1 runs on a local synthetic seed; Supabase is a stubbed adapter so live data swaps in later without touching UI/logic.
4. **Synthetic data only**, clearly labeled.

## 1. CONTEXT
- **Problem:** Storage prices are set manually and don't react to occupancy, competitor moves, or seasonality. Revenue is left on the table.
- **Primary user:** Head of Revenue & Marketing. **Secondary:** VP Strategy & Finance (governance/override), CEO/investors (read the rationale).
- **Vibe:** "Trading desk for unit prices." Confident, dense, premium, trustworthy — it touches money.

## 2. STACK
Next.js 15 (App Router, RSC, Server Actions) · TypeScript (strict) · Tailwind + shadcn-style UI · Anthropic TS SDK (`claude-sonnet-5`, structured output) · Supabase (Postgres, stubbed v1) · Vercel.

## 3. DATA MODEL
`Store`, `StoreUnit`, `CompetitorSnapshot`, `PriceRecommendation` (see `lib/data/types.ts`).

## 4. PRICING ENGINE (pure, unit-tested)
```
occ          = occupied / count
compAvg      = mean(competitor rates)            // 0 if none
season       = seasonalIndex[month]              // 0.92..1.10
occupancyAdj = >=.95 ? +.08 : >=.90 ? +.05 : >=.80 ? +.02 : >=.60 ? .00 : >=.45 ? -.03 : -.06
compGap      = (compAvg - currentRate) / currentRate
compAdj      = clamp(compGap * 0.5, -0.05, +0.07)
raw          = currentRate * (1 + occupancyAdj + compAdj) * season
target       = clamp(roundToStep(raw, 5), currentRate*0.85, currentRate*1.15)  // ±15% guardrail
```

## 5. CLAUDE ADVISOR
Input: engine output + qualitative context (competitor promo text, market note). Forced structured output: `{ recommendedPrice, confidence, rationale[3], keyDrivers[], riskNote|null }`. System prompt enforces: validate target, ground rationale in real numbers, never go outside the guardrail band. Model `claude-sonnet-5`, temperature ~0.2.

## 6. DATA FLOW (Server Actions)
`runPricing(storeId)` → load units/competitors → per unit: `runEngine()` → `advise()` → persist → return recs. `decideRecommendation(storeId, id, decision, finalPrice?)` → patch + audit → `revalidatePath`.

## 7. UI COMPONENTS
StoreSelector (store list) · PricingDesk (client orchestrator) · UnitPriceRow · RationalePanel · RunPricingButton · DecisionBar · DeltaChip · OccupancyBar · ConfidenceBadge · RecommendationHistory.

## 8. STATE MANAGEMENT
Server Components fetch; Server Actions mutate. No Redux/Zustand. Client uses `useTransition` + `useState`.

## 9. DESIGN SYSTEM — "Trading-Desk Dark"
bg `zinc-950`, panels `zinc-900/40`, hairline borders `white/10`. Semantic color: push/emerald, pull/rose, flat/zinc. Mono `tabular-nums` right-aligned for all numerics. Tight density, 150–200ms transitions, emerald/rose decision flashes. WCAG AA contrast, full keyboard nav.

## 10. OUT OF SCOPE (v1)
Auth · live competitor scraping · real PMS writeback · scheduling/batch · simultaneous multi-store.
