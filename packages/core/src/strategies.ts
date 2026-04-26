import { enrichMatches } from "./lines.js";
import { normalizeForSearch, stripCombiningMarks } from "./normalize.js";
import type { Match, SearchOptions } from "./types.js";

function collectLiteral(
  haystackNorm: string,
  needleNorm: string,
  haystackRaw: string,
  maxMatches: number
): Match[] {
  if (needleNorm.length === 0) return [];
  const ranges: { start: number; end: number }[] = [];
  let from = 0;
  while (ranges.length < maxMatches) {
    const idx = haystackNorm.indexOf(needleNorm, from);
    if (idx === -1) break;
    ranges.push({ start: idx, end: idx + needleNorm.length });
    from = idx + (needleNorm.length || 1);
  }
  return enrichMatches(haystackRaw, ranges);
}

/** Token mode: every token must appear in order (non-overlapping greedy scan). */
function collectTokensOrdered(
  haystackNorm: string,
  tokens: string[],
  haystackRaw: string,
  maxMatches: number
): Match[] {
  const cleaned = tokens.map((t) => t.trim()).filter(Boolean);
  if (cleaned.length === 0) return [];
  const ranges: { start: number; end: number }[] = [];
  let searchFrom = 0;
  while (ranges.length < maxMatches) {
    let start = -1;
    let end = searchFrom;
    for (const tok of cleaned) {
      if (tok.length === 0) continue;
      const i = haystackNorm.indexOf(tok, end);
      if (i === -1) {
        start = -1;
        break;
      }
      if (start === -1) start = i;
      end = i + tok.length;
    }
    if (start === -1) break;
    ranges.push({ start, end });
    searchFrom = start + 1;
  }
  return enrichMatches(haystackRaw, ranges);
}

export type AutoMode = "auto";

export interface StrategyResult {
  strategyId: string;
  matches: Match[];
}

const DEFAULT_MAX = 500;

/**
 * Auto chain: normalized literal → no-accents literal → ordered tokens (split on whitespace).
 */
export function searchAuto(haystack: string, query: string, options: SearchOptions = {}): StrategyResult[] {
  const maxMatches = options.maxMatches ?? DEFAULT_MAX;
  const q = query.trim();
  if (!q) return [];

  const results: StrategyResult[] = [];

  const normH = normalizeForSearch(haystack);
  const normQ = normalizeForSearch(q);
  let m = collectLiteral(normH, normQ, haystack, maxMatches);
  results.push({ strategyId: "literalNormalized", matches: m });
  if (m.length > 0) return results;

  const h2 = stripCombiningMarks(normH);
  const q2 = stripCombiningMarks(normQ);
  m = collectLiteral(h2, q2, haystack, maxMatches);
  results.push({ strategyId: "literalNormalizedNoAccents", matches: m });
  if (m.length > 0) return results;

  const tokens = normQ.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    m = collectTokensOrdered(normH, tokens, haystack, maxMatches);
    results.push({ strategyId: "tokensAnd", matches: m });
  }

  return results;
}

/** Single-strategy search for manual mode. */
export function searchLiteralNormalized(haystack: string, query: string, options: SearchOptions = {}): Match[] {
  const maxMatches = options.maxMatches ?? DEFAULT_MAX;
  const q = query.trim();
  if (!q) return [];
  return collectLiteral(normalizeForSearch(haystack), normalizeForSearch(q), haystack, maxMatches);
}
