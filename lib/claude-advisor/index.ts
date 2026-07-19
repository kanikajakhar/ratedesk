import type { EngineOutput } from "@/lib/pricing-engine";
import type { Confidence } from "@/lib/data/types";
import { ADVISOR_SYSTEM_PROMPT } from "./prompt";
import { ADVISOR_TOOL_NAME, ADVISOR_TOOL_SCHEMA } from "./schema";
import type { AdvisorResult } from "./types";

export interface AdviseContext {
  currentRate: number;
  competitorPromos: string[];
  marketNote?: string;
}

/**
 * Produce a recommendation for one unit size.
 *
 * Calls Claude with forced structured output; on any error it falls back to a
 * deterministic mock derived from the engine output, so the app always works.
 *
 * Auth + endpoint are all optional, read from the environment:
 * - ANTHROPIC_API_KEY    → sent as the `x-api-key` header (official Anthropic style)
 * - ANTHROPIC_AUTH_TOKEN → sent as `Authorization: Bearer` (proxy / relay style)
 * - ANTHROPIC_BASE_URL   → alternate endpoint, e.g. a proxy or relay
 * - ANTHROPIC_MODEL      → override the model id (default `claude-sonnet-5`)
 * Set ANTHROPIC_API_KEY OR ANTHROPIC_AUTH_TOKEN to enable real Claude.
 */
export async function advise(
  engine: EngineOutput,
  ctx: AdviseContext,
): Promise<AdvisorResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!apiKey && !authToken) return mockAdvise(engine, ctx);

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({
      // x-api-key when ANTHROPIC_API_KEY is set; Bearer when AUTH_TOKEN is set.
      apiKey: authToken ? undefined : apiKey,
      authToken: authToken ?? undefined,
      baseURL: process.env.ANTHROPIC_BASE_URL,
    });

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
      max_tokens: 700,
      temperature: 0.2,
      system: ADVISOR_SYSTEM_PROMPT,
      tool_choice: { type: "tool", name: ADVISOR_TOOL_NAME },
      tools: [
        {
          name: ADVISOR_TOOL_NAME,
          description: "Record the final pricing recommendation with rationale.",
          input_schema: ADVISOR_TOOL_SCHEMA,
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(engine, ctx) }],
    });

    const toolUse = message.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return mockAdvise(engine, ctx);
    }
    return normalizeAdvisorResult(toolUse.input, engine);
  } catch (err) {
    console.warn("[claude-advisor] Claude call failed — using mock:", err);
    return mockAdvise(engine, ctx);
  }
}

function buildUserPrompt(engine: EngineOutput, ctx: AdviseContext): string {
  const lines = [
    `Unit size: ${engine.sizeLabel}`,
    `Current street rate: $${ctx.currentRate}`,
    `Occupancy: ${(engine.occupancy * 100).toFixed(0)}%`,
    `Competitor average: ${
      engine.competitorAvg > 0
        ? `$${engine.competitorAvg.toFixed(0)} (gap ${(engine.competitorGap * 100).toFixed(1)}%)`
        : "no competitor data for this size"
    }`,
    `Seasonal index: ${engine.season.toFixed(2)}`,
    `Deterministic engine target: $${engine.target} (guardrail $${engine.band.lo.toFixed(0)}–$${engine.band.hi.toFixed(0)})`,
    ``,
    `Competitor context:`,
    ...(ctx.competitorPromos.length
      ? ctx.competitorPromos.map((p) => `- ${p}`)
      : ["- none available for this size"]),
  ];
  if (ctx.marketNote) lines.push(``, `Market: ${ctx.marketNote}`);
  lines.push(``, `Produce the recommendation via the ${ADVISOR_TOOL_NAME} tool.`);
  return lines.join("\n");
}

function normalizeAdvisorResult(input: unknown, engine: EngineOutput): AdvisorResult {
  const i = (input ?? {}) as Record<string, unknown>;
  let recommendedPrice = Number(i.recommendedPrice);
  if (!Number.isFinite(recommendedPrice)) recommendedPrice = engine.target;
  // Hard guarantee: never outside the guardrail band, regardless of model output.
  recommendedPrice = Math.max(
    engine.band.lo,
    Math.min(engine.band.hi, recommendedPrice),
  );

  const confidenceRaw = String(i.confidence ?? "medium");
  const confidence: Confidence =
    confidenceRaw === "high" || confidenceRaw === "low" ? confidenceRaw : "medium";

  const rationale = Array.isArray(i.rationale)
    ? i.rationale.slice(0, 3).map((b) => String(b))
    : [];

  const keyDrivers = Array.isArray(i.keyDrivers)
    ? i.keyDrivers.map((d) => String(d))
    : [];

  // Treat a literal "null"/"" string as absent — some relays/models (e.g. GLM
  // behind an Anthropic-compatible proxy) emit that instead of JSON null.
  const riskNoteRaw = i.riskNote;
  const riskNote =
    riskNoteRaw && riskNoteRaw !== "null" ? String(riskNoteRaw) : null;

  return { recommendedPrice, confidence, rationale, keyDrivers, riskNote };
}

// ── Deterministic fallback ──────────────────────────────────────────────────
// Used when no API key is set. Reads the engine's own components so the
// rationale still references real numbers.
function mockAdvise(engine: EngineOutput, ctx: AdviseContext): AdvisorResult {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.warn(
      "[claude-advisor] No ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN — using deterministic mock. Set a key for real Claude rationale.",
    );
  }

  const occPct = Math.round(engine.occupancy * 100);
  const gapPctNum = engine.competitorGap * 100;
  const gapPct = gapPctNum.toFixed(1);
  const hasComps = engine.competitorAvg > 0;

  const rationale: string[] = [
    `${occPct}% occupancy on this size — ${
      engine.occupancyAdj >= 0 ? "demand supports" : "demand warrants softening"
    } the rate.`,
    hasComps
      ? `Competitor average sits ${gapPctNum >= 0 ? "+" : ""}${gapPct}% vs. our street rate across ${ctx.competitorPromos.length} nearby comp${ctx.competitorPromos.length === 1 ? "" : "s"}.`
      : `No direct competitor benchmark for this size — moving on occupancy alone.`,
    `Seasonal index of ${engine.season.toFixed(2)} ${
      engine.season >= 1 ? "amplifies" : "tempers"
    } the move this month.`,
  ];

  const moveSize = Math.abs(engine.target - ctx.currentRate) / (ctx.currentRate || 1);
  const confidence: Confidence =
    moveSize > 0.08 ? "high" : engine.occupancy >= 0.6 ? "medium" : "low";

  const keyDrivers = [
    `${occPct}% occ`,
    hasComps ? `comp ${gapPctNum >= 0 ? "+" : ""}${gapPct}%` : "no comp",
    `season ${engine.season.toFixed(2)}`,
  ];

  const riskNote =
    engine.occupancy < 0.45
      ? "Very low occupancy — confirm the unit mix isn't mismarked before discounting."
      : null;

  return {
    recommendedPrice: engine.target,
    confidence,
    rationale,
    keyDrivers,
    riskNote,
  };
}
