export type { Match, SearchOptions, SearchStrategyId, TextRange } from "./types.js";
export { lineStartIndices, rangeToLineColumn, enrichMatches } from "./lines.js";
export { normalizeForSearch, stripCombiningMarks } from "./normalize.js";
export {
  searchAuto,
  searchLiteralNormalized,
  type StrategyResult,
} from "./strategies.js";
export { getWinningMatches, type WinningResult } from "./winning.js";
