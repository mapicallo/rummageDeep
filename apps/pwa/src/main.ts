import { searchAuto, searchLiteralNormalized, type Match, type StrategyResult } from "@rummagedeep/core";
import { escapeHtml, snippetAround } from "./snippet.js";
import "./style.css";

const MAX_CHARS = 2_000_000;

let lastResults: StrategyResult[] = [];
let activeMatches: Match[] = [];
let activeStrategy = "";
let haystack = "";

function $(sel: string): HTMLElement {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing ${sel}`);
  return el as HTMLElement;
}

function render() {
  document.body.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="header-row">
          <div class="logo">
            <div class="logo-icon" aria-hidden="true">🔍</div>
            <div class="logo-text">
              <h1>RummageDeep</h1>
              <p class="subtitle">By AI4Context</p>
            </div>
          </div>
          <span class="badge-ai4c">Local-first · no cloud required</span>
        </div>
      </header>
      <main class="app-main">
        <p class="honest-banner">
          <strong>We don’t promise every match exists.</strong>
          If nothing shows up, the text may not be loaded, may live in another frame, or may not be searchable
          (e.g. some PDFs). This tool tries several normalizations before giving up.
        </p>
        <div>
          <div class="section-title">Content</div>
          <div class="textarea-wrap">
            <textarea
              id="content"
              class="content-input"
              placeholder="Paste logs, exports, or long text here…"
              aria-label="Content to search"
            ></textarea>
          </div>
          <div class="file-row" style="margin-top:10px">
            <input type="file" id="file" accept=".txt,.log,.md,.json,text/*" />
            <span id="fileHint">Optional: load a small text file</span>
          </div>
        </div>
        <div>
          <div class="section-title">Search</div>
          <div class="toolbar">
            <div class="field" style="flex:2">
              <label for="query">Query</label>
              <input type="text" id="query" placeholder="Term or phrase…" autocomplete="off" />
            </div>
            <div class="field">
              <label for="mode">Mode</label>
              <select id="mode" aria-label="Search mode">
                <option value="auto" selected>Auto (recommended)</option>
                <option value="literal">Literal normalized only</option>
              </select>
            </div>
            <button type="button" class="btn btn-primary" id="searchBtn">Rummage</button>
          </div>
        </div>
        <div class="status-card" id="statusCard" hidden>
          <div class="status-line" id="statusLine"></div>
          <div class="status-meta" id="statusMeta"></div>
        </div>
        <div>
          <div class="section-title">Matches</div>
          <div class="results" id="results"></div>
        </div>
      </main>
      <footer class="app-footer">
        <span>RummageDeep v0.1 · AI4Context family</span>
        <a href="https://github.com/mapicallo/rummageDeep" target="_blank" rel="noopener">Source</a>
      </footer>
    </div>
  `;

  const contentEl = $("#content") as HTMLTextAreaElement;
  const queryEl = $("#query") as HTMLInputElement;
  const modeEl = $("#mode") as HTMLSelectElement;
  const searchBtn = $("#searchBtn") as HTMLButtonElement;
  const resultsEl = $("#results") as HTMLElement;
  const statusCard = $("#statusCard") as HTMLElement;
  const statusLine = $("#statusLine") as HTMLElement;
  const statusMeta = $("#statusMeta") as HTMLElement;
  const fileEl = $("#file") as HTMLInputElement;

  fileEl.addEventListener("change", async () => {
    const f = fileEl.files?.[0];
    if (!f) return;
    if (f.size > MAX_CHARS) {
      alert(`File too large for this MVP (max ${MAX_CHARS} bytes).`);
      return;
    }
    const text = await f.text();
    contentEl.value = text;
  });

  function runSearch() {
    haystack = contentEl.value;
    const query = queryEl.value;
    resultsEl.innerHTML = "";
    lastResults = [];
    activeMatches = [];
    activeStrategy = "";

    if (!query.trim()) {
      statusCard.hidden = true;
      resultsEl.innerHTML = `<div class="results-empty">Enter a query to search.</div>`;
      return;
    }

    if (haystack.length > MAX_CHARS) {
      statusCard.hidden = false;
      statusLine.textContent = "Content too large.";
      statusMeta.textContent = `Trim to under ${MAX_CHARS} characters for this preview build.`;
      resultsEl.innerHTML = `<div class="results-empty">Reduce size and try again.</div>`;
      return;
    }

    const mode = modeEl.value;
    if (mode === "literal") {
      const matches = searchLiteralNormalized(haystack, query);
      lastResults = [{ strategyId: "literalNormalized", matches }];
    } else {
      lastResults = searchAuto(haystack, query);
    }

    const winning = lastResults.find((r) => r.matches.length > 0);
    activeMatches = winning?.matches ?? [];
    activeStrategy = winning?.strategyId ?? lastResults[lastResults.length - 1]?.strategyId ?? "";

    statusCard.hidden = false;
    if (activeMatches.length === 0) {
      statusLine.textContent = "No matches with current modes.";
      statusMeta.textContent =
        "The string might be absent, split across lines differently, or hidden in a format we can’t see here. Try Auto, shorten the query, or paste a smaller slice.";
      resultsEl.innerHTML = `<div class="results-empty">No results — see note above.</div>`;
      return;
    }

    statusLine.textContent = `${activeMatches.length} match(es) found`;
    statusMeta.textContent = `Strategy: ${activeStrategy.replace(/([A-Z])/g, " $1").trim()}`;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < activeMatches.length; i++) {
      const m = activeMatches[i]!;
      const { before, match, after } = snippetAround(haystack, m.start, m.end);
      const row = document.createElement("div");
      row.className = "match-item";
      row.innerHTML = `
        <div class="match-meta">#${i + 1} · line ${m.line}, col ${m.column} · chars ${m.start}–${m.end}</div>
        <div>${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}</div>
      `;
      row.addEventListener("click", () => {
        contentEl.focus();
        try {
          contentEl.setSelectionRange(m.start, m.end);
        } catch {
          /* ignore */
        }
      });
      frag.appendChild(row);
    }
    resultsEl.appendChild(frag);
  }

  searchBtn.addEventListener("click", runSearch);
  queryEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

render();
