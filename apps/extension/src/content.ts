import { getWinningMatches } from "@rummagedeep/core";
import { buildHaystack, collectTextSegments, rangeForGlobalOffsets } from "./dom.js";

const HIGHLIGHT_OTHERS = "rummagedeep-all";
const HIGHLIGHT_ACTIVE = "rummagedeep-active";
const STYLE_ID = "rummagedeep-highlight-style";
const MAX_RANGES = 120;

let storedRanges: Range[] = [];
let activeMatchIndex = 0;

declare global {
  interface Window {
    __RUMMAGEDEEP_CONTENT__?: boolean;
  }
}

function ensureHighlightStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ::highlight(${HIGHLIGHT_OTHERS}) {
      background-color: rgba(255, 230, 102, 0.72);
      color: inherit;
    }
    ::highlight(${HIGHLIGHT_ACTIVE}) {
      background-color: rgba(255, 120, 0, 0.92);
      color: #141414;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  `;
  document.documentElement.appendChild(style);
}

function deleteNamedHighlights(): void {
  if (!window.CSS?.highlights) return;
  CSS.highlights.delete(HIGHLIGHT_OTHERS);
  CSS.highlights.delete(HIGHLIGHT_ACTIVE);
}

function clearHighlights(): void {
  storedRanges = [];
  activeMatchIndex = 0;
  deleteNamedHighlights();
}

function applyDualHighlights(): void {
  if (!window.CSS?.highlights || storedRanges.length === 0) return;
  const n = storedRanges.length;
  const idx = Math.max(0, Math.min(activeMatchIndex, n - 1));
  activeMatchIndex = idx;

  const activeRange = storedRanges[idx];
  const others = storedRanges.filter((_, i) => i !== idx);

  if (others.length > 0) {
    CSS.highlights.set(HIGHLIGHT_OTHERS, new Highlight(...others));
  } else {
    CSS.highlights.delete(HIGHLIGHT_OTHERS);
  }

  if (activeRange && !activeRange.collapsed) {
    CSS.highlights.set(HIGHLIGHT_ACTIVE, new Highlight(activeRange));
  } else {
    CSS.highlights.delete(HIGHLIGHT_ACTIVE);
  }
}

function scrollRangeIntoView(r: Range | undefined): void {
  if (!r || r.collapsed) return;
  const el = r.startContainer.parentElement;
  el?.scrollIntoView({ block: "center", behavior: "smooth" });
}

function navigateMatch(delta: number): { current: number; total: number } | null {
  if (storedRanges.length === 0) return null;
  const n = storedRanges.length;
  activeMatchIndex = ((activeMatchIndex + delta) % n + n) % n;
  applyDualHighlights();
  scrollRangeIntoView(storedRanges[activeMatchIndex]);
  return { current: activeMatchIndex + 1, total: n };
}

function runSearch(query: string, mode: "auto" | "literal"): {
  matchCount: number;
  strategyId: string;
  usedHighlightApi: boolean;
  highlightCount: number;
  warn?: string;
} {
  clearHighlights();
  const root = document.body ?? document.documentElement;
  const segments = collectTextSegments(root);
  const haystack = buildHaystack(segments);
  const result = getWinningMatches(haystack, query, mode);

  if (!result || result.matches.length === 0) {
    return { matchCount: 0, strategyId: "", usedHighlightApi: false, highlightCount: 0 };
  }

  const usedHighlightApi = Boolean(window.CSS && CSS.highlights);
  if (!usedHighlightApi) {
    return {
      matchCount: result.matches.length,
      strategyId: result.strategyId,
      usedHighlightApi: false,
      highlightCount: 0,
      warn: "CSS Highlight API not available in this page/browser; install Chromium-based browser for in-page highlights.",
    };
  }

  ensureHighlightStyle();
  const ranges: Range[] = [];
  for (const m of result.matches) {
    if (ranges.length >= MAX_RANGES) break;
    const r = rangeForGlobalOffsets(segments, m.start, m.end);
    if (r && !r.collapsed) ranges.push(r);
  }

  if (ranges.length === 0) {
    return {
      matchCount: result.matches.length,
      strategyId: result.strategyId,
      usedHighlightApi: true,
      highlightCount: 0,
      warn: "Matches found in flattened text but could not map to the live DOM (dynamic content). Try the PWA with pasted HTML/text.",
    };
  }

  storedRanges = ranges;
  activeMatchIndex = 0;
  applyDualHighlights();
  scrollRangeIntoView(storedRanges[0]);

  return {
    matchCount: result.matches.length,
    strategyId: result.strategyId,
    usedHighlightApi: true,
    highlightCount: ranges.length,
  };
}

function init(): void {
  if (window.__RUMMAGEDEEP_CONTENT__) return;
  window.__RUMMAGEDEEP_CONTENT__ = true;

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "RUMMAGE_CLEAR") {
      clearHighlights();
      sendResponse({ ok: true });
      return true;
    }
    if (msg?.type === "RUMMAGE_SEARCH") {
      const query = String(msg.query ?? "");
      const mode = msg.mode === "literal" ? "literal" : "auto";
      try {
        const out = runSearch(query, mode);
        sendResponse({ ok: true, ...out });
      } catch (e) {
        sendResponse({
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      return true;
    }
    if (msg?.type === "RUMMAGE_NAV") {
      const dir = msg.direction === -1 ? -1 : 1;
      try {
        const nav = navigateMatch(dir);
        if (!nav) {
          sendResponse({ ok: false, error: "no_matches" });
        } else {
          sendResponse({ ok: true, ...nav });
        }
      } catch (e) {
        sendResponse({
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      return true;
    }
    return false;
  });
}

init();
