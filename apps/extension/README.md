# RummageDeep — Chrome extension (v0.3.x)

- **Floating panel**: Click the toolbar icon to open or focus a **movable, resizable** popup window (use the **system** title bar to minimize, maximize, or close).
- **In-tab search**: Injects `content.js` on demand (`activeTab` + `scripting`), uses `@rummagedeep/core`, highlights with the **CSS Custom Highlight API** when available (Chromium).
- **Languages**: English / Español — stored in `chrome.storage.sync` under `rummageDeepUiLang`.

## Build and load

From the monorepo root:

```bash
npm install
npm run build -w @rummagedeep/extension
```

**Load unpacked** → folder **`apps/extension/dist`**.

## Icons

Source vector: `icons-source/rummagedeep.svg` (magnifier + “depth” lines, AI4Context gradient). Regenerate PNGs after editing the SVG:

```bash
npm run icons -w @rummagedeep/extension
```

Outputs `icons/icon16.png` … `icon128.png`; Vite copies them into `public/icons` on each build.

## Limits

Flattened DOM text only (no shadow roots / iframes). Restricted URLs cannot be scripted.
