/** Byte offsets into the original string (UTF-16 code units, same as JS string indices). */
export interface TextRange {
  start: number;
  end: number;
}

export interface Match extends TextRange {
  /** 1-based line number of `start`. */
  line: number;
  /** 0-based column (code units) of `start` within the line. */
  column: number;
}

export type SearchStrategyId =
  | "literalNormalized"
  | "literalNormalizedNoAccents"
  | "tokensAnd";

export interface SearchOptions {
  /** Max matches to collect (safety). */
  maxMatches?: number;
  /** Regex timeout ms (future). */
  regexTimeoutMs?: number;
}
