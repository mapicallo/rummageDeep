/** Extract a snippet around [start,end) with ellipsis. */
export function snippetAround(
  text: string,
  start: number,
  end: number,
  context = 48
): { before: string; match: string; after: string } {
  const a = Math.max(0, start - context);
  const b = Math.min(text.length, end + context);
  return {
    before: (a > 0 ? "…" : "") + text.slice(a, start),
    match: text.slice(start, end),
    after: text.slice(end, b) + (b < text.length ? "…" : ""),
  };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
