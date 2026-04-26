(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();function H(t){const n=[0];for(let s=0;s<t.length;s++)t[s]===`
`&&n.push(s+1);return n}function N(t,n){const{start:s}=t;let a=1;for(let e=n.length-1;e>=0;e--)if(n[e]<=s)return a=e+1,{line:a,column:s-n[e]};return{line:1,column:s}}function T(t,n){const s=H(t);return n.map(a=>({...a,...N(a,s)}))}function M(t,n=!0){return(n?t.normalize("NFC"):t).toLowerCase()}function A(t){return t.normalize("NFD").replace(new RegExp("\\p{M}","gu"),"")}function E(t,n,s,a){if(n.length===0)return[];const e=[];let r=0;for(;e.length<a;){const i=t.indexOf(n,r);if(i===-1)break;e.push({start:i,end:i+n.length}),r=i+(n.length||1)}return T(s,e)}function O(t,n,s,a){const e=n.map(o=>o.trim()).filter(Boolean);if(e.length===0)return[];const r=[];let i=0;for(;r.length<a;){let o=-1,c=i;for(const m of e){if(m.length===0)continue;const l=t.indexOf(m,c);if(l===-1){o=-1;break}o===-1&&(o=l),c=l+m.length}if(o===-1)break;r.push({start:o,end:c}),i=o+1}return T(s,r)}const w=500;function F(t,n,s={}){const a=s.maxMatches??w,e=n.trim();if(!e)return[];const r=[],i=M(t),o=M(e);let c=E(i,o,t,a);if(r.push({strategyId:"literalNormalized",matches:c}),c.length>0)return r;const m=A(i),l=A(o);if(c=E(m,l,t,a),r.push({strategyId:"literalNormalizedNoAccents",matches:c}),c.length>0)return r;const v=o.split(/\s+/).filter(Boolean);return v.length>1&&(c=O(i,v,t,a),r.push({strategyId:"tokensAnd",matches:c})),r}function k(t,n,s={}){const a=s.maxMatches??w,e=n.trim();return e?E(M(t),M(e),t,a):[]}function D(t,n,s,a=48){const e=Math.max(0,n-a),r=Math.min(t.length,s+a);return{before:(e>0?"…":"")+t.slice(e,n),match:t.slice(n,s),after:t.slice(s,r)+(r<t.length?"…":"")}}function L(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const x=2e6;let p=[],g=[],C="",y="";function u(t){const n=document.querySelector(t);if(!n)throw new Error(`Missing ${t}`);return n}function P(){document.body.innerHTML=`
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
  `;const t=u("#content"),n=u("#query"),s=u("#mode"),a=u("#searchBtn"),e=u("#results"),r=u("#statusCard"),i=u("#statusLine"),o=u("#statusMeta"),c=u("#file");c.addEventListener("change",async()=>{var d;const l=(d=c.files)==null?void 0:d[0];if(!l)return;if(l.size>x){alert(`File too large for this MVP (max ${x} bytes).`);return}const v=await l.text();t.value=v});function m(){var q;y=t.value;const l=n.value;if(e.innerHTML="",p=[],g=[],C="",!l.trim()){r.hidden=!0,e.innerHTML='<div class="results-empty">Enter a query to search.</div>';return}if(y.length>x){r.hidden=!1,i.textContent="Content too large.",o.textContent=`Trim to under ${x} characters for this preview build.`,e.innerHTML='<div class="results-empty">Reduce size and try again.</div>';return}s.value==="literal"?p=[{strategyId:"literalNormalized",matches:k(y,l)}]:p=F(y,l);const d=p.find(f=>f.matches.length>0);if(g=(d==null?void 0:d.matches)??[],C=(d==null?void 0:d.strategyId)??((q=p[p.length-1])==null?void 0:q.strategyId)??"",r.hidden=!1,g.length===0){i.textContent="No matches with current modes.",o.textContent="The string might be absent, split across lines differently, or hidden in a format we can’t see here. Try Auto, shorten the query, or paste a smaller slice.",e.innerHTML='<div class="results-empty">No results — see note above.</div>';return}i.textContent=`${g.length} match(es) found`,o.textContent=`Strategy: ${C.replace(/([A-Z])/g," $1").trim()}`;const $=document.createDocumentFragment();for(let f=0;f<g.length;f++){const h=g[f],{before:S,match:z,after:I}=D(y,h.start,h.end),b=document.createElement("div");b.className="match-item",b.innerHTML=`
        <div class="match-meta">#${f+1} · line ${h.line}, col ${h.column} · chars ${h.start}–${h.end}</div>
        <div>${L(S)}<mark>${L(z)}</mark>${L(I)}</div>
      `,b.addEventListener("click",()=>{t.focus();try{t.setSelectionRange(h.start,h.end)}catch{}}),$.appendChild(b)}e.appendChild($)}a.addEventListener("click",m),n.addEventListener("keydown",l=>{l.key==="Enter"&&m()})}P();
