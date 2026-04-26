import "./panel.css";
import {
  getStoredLang,
  setStoredLang,
  stringsFor,
  type UILang,
  type UiStrings,
} from "./i18n.js";
import { resolveTargetTabId } from "./tabContext.js";

let currentStrings: UiStrings = stringsFor("en");
/** Last search result for navigation (highlights on page). */
let lastNavTotal = 0;
let lastNavCurrent = 1;

function getModeSelect(): HTMLSelectElement | null {
  return document.getElementById("mode") as HTMLSelectElement | null;
}

function updateModeHint(): void {
  const hint = document.getElementById("modeHint");
  const mode = getModeSelect()?.value;
  if (!hint) return;
  if (mode === "literal") {
    hint.textContent = currentStrings.modeHelpLiteral;
  } else {
    hint.textContent = currentStrings.modeHelpAuto;
  }
}

function formatNavMatch(n: number, total: number): string {
  return currentStrings.navMatchOf.replace("{{n}}", String(n)).replace("{{total}}", String(total));
}

function updateMatchNavLabel(current: number, total: number): void {
  const el = document.getElementById("matchPosition");
  if (el) el.textContent = formatNavMatch(current, total);
}

function hideMatchNav(): void {
  document.getElementById("matchNav")?.setAttribute("hidden", "");
  lastNavTotal = 0;
  lastNavCurrent = 1;
}

function showMatchNav(total: number, startAt = 1): void {
  lastNavTotal = total;
  lastNavCurrent = startAt;
  const nav = document.getElementById("matchNav");
  if (!nav || total < 1) return;
  nav.removeAttribute("hidden");
  updateMatchNavLabel(startAt, total);
}

function hideResultBanner(): void {
  document.getElementById("statusBanner")?.setAttribute("hidden", "");
  hideMatchNav();
}

function showResultBanner(opts: {
  matchCount: number;
  highlightCount: number;
  usedHighlightApi: boolean;
  warn?: string;
}): void {
  const { matchCount, highlightCount, usedHighlightApi, warn } = opts;
  const banner = document.getElementById("statusBanner");
  const countEl = document.getElementById("statusBannerCount");
  const lineEl = document.getElementById("statusBannerLine");
  const subEl = document.getElementById("statusBannerSub");
  const plain = document.getElementById("statusPlain");
  if (!banner || !countEl || !lineEl || !subEl || !plain) return;

  const displayCount = highlightCount > 0 ? highlightCount : matchCount;
  countEl.textContent = String(displayCount);
  lineEl.textContent = currentStrings.resultsBannerCaption;

  const parts: string[] = [];
  if (usedHighlightApi) {
    parts.push(currentStrings.resultsBannerNoteHighlight);
  } else {
    parts.push(currentStrings.resultsBannerNoteNoVisual);
  }
  if (matchCount > highlightCount && highlightCount > 0) {
    parts.push(currentStrings.resultsMoreOnPage.replace("{{shown}}", String(highlightCount)));
  }
  if (warn?.trim()) parts.push(warn.trim());
  subEl.textContent = parts.join(" ");
  subEl.hidden = !parts.join(" ").trim();

  plain.textContent = "";
  plain.classList.remove("error");
  plain.hidden = true;
  banner.removeAttribute("hidden");

  if (usedHighlightApi && highlightCount > 0) {
    showMatchNav(highlightCount, 1);
  } else {
    hideMatchNav();
  }
}

function setPlainStatus(text: string, isError = false): void {
  hideResultBanner();
  const plain = document.getElementById("statusPlain");
  if (!plain) return;
  plain.textContent = text;
  plain.hidden = !text;
  plain.classList.toggle("error", isError);
}

function applyStrings(s: UiStrings, lang: UILang): void {
  document.documentElement.lang = lang === "es" ? "es" : "en";

  const subtitle = document.getElementById("subtitle");
  if (subtitle) subtitle.textContent = s.subtitle;

  const languageLabel = document.getElementById("languageLabel");
  if (languageLabel) languageLabel.textContent = s.languageLabel;

  const lede = document.getElementById("ledeSearch");
  if (lede) lede.textContent = s.ledeSearch;

  const labelQuery = document.getElementById("labelQuery");
  if (labelQuery) labelQuery.textContent = s.labelQuery;

  const query = document.getElementById("query") as HTMLInputElement | null;
  if (query) query.placeholder = s.placeholderQuery;

  const labelMode = document.getElementById("labelMode");
  if (labelMode) labelMode.textContent = s.labelMode;

  const optAuto = document.getElementById("modeOptAuto");
  if (optAuto) optAuto.textContent = s.modeAuto;
  const optLit = document.getElementById("modeOptLiteral");
  if (optLit) optLit.textContent = s.modeLiteral;

  const searchBtn = document.getElementById("searchPage");
  if (searchBtn) searchBtn.textContent = s.btnSearch;
  const clearBtn = document.getElementById("clearPage");
  if (clearBtn) clearBtn.textContent = s.btnClear;

  document.getElementById("matchPrev")?.setAttribute("aria-label", s.navPrevAria);
  document.getElementById("matchNext")?.setAttribute("aria-label", s.navNextAria);

  const gh = document.getElementById("footerGithub");
  if (gh) gh.textContent = s.footerGithub;

  const byPrefix = document.getElementById("footerByPrefix");
  if (byPrefix) byPrefix.textContent = s.footerByPrefix;

  const support = document.getElementById("footerSupport");
  if (support) support.textContent = s.footerSupport;

  const ver = document.getElementById("versionText");
  if (ver) {
    try {
      ver.textContent = `${s.versionPrefix} ${chrome.runtime.getManifest().version}`;
    } catch {
      ver.textContent = s.versionPrefix;
    }
  }

  updateModeHint();
  if (lastNavTotal > 0) {
    updateMatchNavLabel(lastNavCurrent, lastNavTotal);
  }
}

async function ensureContentInjected(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  });
}

async function initI18n(): Promise<void> {
  const lang = await getStoredLang();
  const langSelect = document.getElementById("languageSelect") as HTMLSelectElement | null;
  if (langSelect) langSelect.value = lang;
  currentStrings = stringsFor(lang);
  applyStrings(currentStrings, lang);

  langSelect?.addEventListener("change", async () => {
    const next = langSelect.value === "es" ? "es" : "en";
    await setStoredLang(next);
    currentStrings = stringsFor(next);
    applyStrings(currentStrings, next);
  });

  getModeSelect()?.addEventListener("change", () => {
    updateModeHint();
  });
}

document.getElementById("searchPage")?.addEventListener("click", async () => {
  const query = (document.getElementById("query") as HTMLInputElement)?.value ?? "";
  const mode =
    (document.getElementById("mode") as HTMLSelectElement)?.value === "literal" ? "literal" : "auto";

  if (!query.trim()) {
    setPlainStatus(currentStrings.statusEnterQuery, true);
    return;
  }

  const tabId = await resolveTargetTabId();
  if (tabId === undefined) {
    setPlainStatus(currentStrings.statusNoTab, true);
    return;
  }

  setPlainStatus(currentStrings.statusSearching, false);

  try {
    await ensureContentInjected(tabId);
  } catch (e) {
    console.warn("RummageDeep inject failed", e);
    setPlainStatus(currentStrings.statusRestricted, true);
    return;
  }

  try {
    const res = await chrome.tabs.sendMessage(tabId, { type: "RUMMAGE_SEARCH", query, mode });
    if (!res?.ok) {
      setPlainStatus(res?.error ?? currentStrings.statusSearchFailed, true);
      return;
    }
    if (res.matchCount === 0) {
      setPlainStatus(currentStrings.statusNoMatches, false);
      return;
    }
    const warn = typeof res.warn === "string" ? res.warn : "";
    const highlightCount = typeof res.highlightCount === "number" ? res.highlightCount : 0;
    showResultBanner({
      matchCount: res.matchCount,
      highlightCount,
      usedHighlightApi: Boolean(res.usedHighlightApi),
      warn,
    });
  } catch {
    setPlainStatus(currentStrings.statusTalkFail, true);
  }
});

async function sendNav(direction: 1 | -1): Promise<void> {
  const tabId = await resolveTargetTabId();
  if (tabId === undefined || lastNavTotal < 1) return;
  try {
    const res = await chrome.tabs.sendMessage(tabId, { type: "RUMMAGE_NAV", direction });
    if (res?.ok && typeof res.current === "number" && typeof res.total === "number") {
      lastNavCurrent = res.current;
      lastNavTotal = res.total;
      updateMatchNavLabel(res.current, res.total);
    }
  } catch {
    /* ignore */
  }
}

document.getElementById("matchPrev")?.addEventListener("click", () => {
  void sendNav(-1);
});

document.getElementById("matchNext")?.addEventListener("click", () => {
  void sendNav(1);
});

document.getElementById("clearPage")?.addEventListener("click", async () => {
  const tabId = await resolveTargetTabId();
  if (tabId === undefined) return;
  try {
    await ensureContentInjected(tabId);
    await chrome.tabs.sendMessage(tabId, { type: "RUMMAGE_CLEAR" });
    setPlainStatus(currentStrings.statusCleared);
  } catch {
    setPlainStatus(currentStrings.statusClearFail, true);
  }
});

void initI18n();
