export interface TextSegment {
  node: Text;
  globalStart: number;
  text: string;
}

function isSkippableParent(el: Element | null): boolean {
  if (!el) return true;
  const tag = el.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return true;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT" && (el as HTMLInputElement).type !== "hidden") return true;
  return false;
}

/** Visible text nodes in document order (approximation of what users can read). */
export function collectTextSegments(root: ParentNode): TextSegment[] {
  const out: TextSegment[] = [];
  let globalStart = 0;
  const doc = root.ownerDocument ?? document;
  const walk = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (isSkippableParent(parent)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let n: Node | null;
  while ((n = walk.nextNode())) {
    const text = n.textContent ?? "";
    out.push({ node: n as Text, globalStart, text });
    globalStart += text.length;
  }
  return out;
}

export function buildHaystack(segments: TextSegment[]): string {
  return segments.map((s) => s.text).join("");
}

/** Map global [start, end) to a DOM Range. End is exclusive. */
export function rangeForGlobalOffsets(
  segments: TextSegment[],
  start: number,
  end: number
): Range | null {
  if (end <= start || segments.length === 0) return null;

  const startSegIdx = segmentIndexForOffset(segments, start);
  const endSegIdx = segmentIndexForOffset(segments, end - 1);
  if (startSegIdx < 0 || endSegIdx < 0) return null;

  const startSeg = segments[startSegIdx]!;
  const endSeg = segments[endSegIdx]!;

  const startOffset = start - startSeg.globalStart;
  const endOffset = end - endSeg.globalStart;

  if (
    startOffset < 0 ||
    startOffset > startSeg.text.length ||
    endOffset < 0 ||
    endOffset > endSeg.text.length
  ) {
    return null;
  }

  const range = document.createRange();
  range.setStart(startSeg.node, startOffset);
  range.setEnd(endSeg.node, endOffset);
  return range;
}

function segmentIndexForOffset(segments: TextSegment[], offset: number): number {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]!;
    const end = s.globalStart + s.text.length;
    if (offset < end) return i;
  }
  return -1;
}
