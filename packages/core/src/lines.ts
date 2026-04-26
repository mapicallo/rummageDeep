import type { Match, TextRange } from "./types.js";

/** Build line start indices (0-based line breaks after \n). */
export function lineStartIndices(text: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

export function rangeToLineColumn(range: TextRange, starts: number[]): Pick<Match, "line" | "column"> {
  const { start } = range;
  let line = 1;
  for (let i = starts.length - 1; i >= 0; i--) {
    if (starts[i]! <= start) {
      line = i + 1;
      return { line, column: start - starts[i]! };
    }
  }
  return { line: 1, column: start };
}

export function enrichMatches(text: string, ranges: TextRange[]): Match[] {
  const starts = lineStartIndices(text);
  return ranges.map((r) => ({
    ...r,
    ...rangeToLineColumn(r, starts),
  }));
}
