import type { Match } from "./types.js";
import { searchAuto, searchLiteralNormalized } from "./strategies.js";

export interface WinningResult {
  strategyId: string;
  matches: Match[];
}

/**
 * Returns the first non-empty strategy result (Auto chain) or literal-only.
 */
export function getWinningMatches(
  haystack: string,
  query: string,
  mode: "auto" | "literal"
): WinningResult | null {
  const q = query.trim();
  if (!q) return null;

  if (mode === "literal") {
    const matches = searchLiteralNormalized(haystack, q);
    return matches.length ? { strategyId: "literalNormalized", matches } : null;
  }

  const chain = searchAuto(haystack, q);
  const hit = chain.find((c) => c.matches.length > 0);
  return hit ?? null;
}
