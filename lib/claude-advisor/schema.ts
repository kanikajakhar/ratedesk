// JSON Schema for the forced structured-output tool call.
// Anthropic SDK forces this tool, so the model returns exactly this shape.
export const ADVISOR_TOOL_NAME = "record_recommendation" as const;

export const ADVISOR_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    recommendedPrice: {
      type: "number" as const,
      description: "Final recommended monthly street rate in USD. Must be within the guardrail band.",
    },
    confidence: {
      type: "string" as const,
      enum: ["high", "medium", "low"],
      description: "Confidence in the recommendation, from data strength and move size.",
    },
    rationale: {
      type: "array" as const,
      items: { type: "string" as const },
      minItems: 3,
      maxItems: 3,
      description: "Exactly 3 concise bullets citing the actual numbers provided.",
    },
    keyDrivers: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Short tags, e.g. '92% occ', 'comp +12%', 'season 1.10'.",
    },
    riskNote: {
      type: ["string", "null"] as const,
      description: "Optional one-line caveat, or null.",
    },
  },
  required: ["recommendedPrice", "confidence", "rationale", "keyDrivers", "riskNote"],
};
