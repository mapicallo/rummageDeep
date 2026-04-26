# RummageDeep

**By [AI4Context](https://github.com/mapicallo)** — Search deeper in long text, logs, and (soon) the current tab. We don’t promise every match exists; we try multiple ways to find it.

## Monorepo

| Package | Description |
|--------|-------------|
| `packages/core` | Shared search engine (normalization, strategies). |
| `apps/pwa` | Progressive Web App — paste or open a file, run **Auto** or manual modes. |
| `apps/extension` | Chrome MV3 — same look & feel; full in-tab search in a later milestone. |

## Quick start

```bash
npm install
npm run dev:pwa
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
```

Outputs: `packages/core/dist`, `apps/pwa/dist`.

### Extension (launcher)

Load **unpacked** from `apps/extension` (see `apps/extension/README.md`). It opens the PWA origin (default dev server). Replace `icons/*.png` with RummageDeep artwork before publishing.

## Principles

- **Local-first**: pasted content stays in your browser unless you opt in to something else later.
- **Honest empty states**: no match can mean the text isn’t loaded, is in another frame, or isn’t searchable.
- **AI4Context** umbrella: same privacy stance and design language as our other extensions.

## License

Proprietary / TBD — align with other AI4Context products.
