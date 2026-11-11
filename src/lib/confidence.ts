import type { Confidence, Trend } from "./types";

export const EVIDENCE_WINDOW_DAYS = 30;

// Fixed rule. The AI never sets confidence.
// reference: no dated evidence in the window
// observed: 1 piece of evidence in the window
// supported: 2 or more pieces of evidence in the window
export function confidenceOf(trend: Trend, today = new Date()): Confidence {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - EVIDENCE_WINDOW_DAYS);
  const recent = trend.evidence.filter((e) => new Date(e.observedOn) >= cutoff);
  if (recent.length >= 2) return "supported";
  if (recent.length === 1) return "observed";
  return "reference";
}

export const confidenceLabel: Record<Confidence, string> = {
  reference: "Reference example",
  observed: "Observed",
  supported: "Supported",
};

export const confidenceHelp: Record<Confidence, string> = {
  reference: "No dated evidence in the last 30 days. Not live trend data.",
  observed: "One piece of dated evidence in the last 30 days.",
  supported: "Two or more pieces of dated evidence in the last 30 days.",
};
