/**
 * Unicode NFC + case folding via Unicode-aware lowercasing.
 * Good enough for MVP; extend with full case fold if needed.
 */
export function normalizeForSearch(s: string, nfc = true): string {
  const n = nfc ? s.normalize("NFC") : s;
  /** ASCII-oriented logs: stable length vs `toLocaleLowerCase` for index alignment. */
  return n.toLowerCase();
}

/** Remove combining marks (accents) for “no accents” mode. */
export function stripCombiningMarks(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}
