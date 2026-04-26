import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const root = fileURLToPath(new URL(".", import.meta.url));

/** GitHub Project Pages: set VITE_BASE=/rummageDeep/ in CI (trailing slash). Local dev: omit. */
const rawBase = process.env.VITE_BASE?.trim();
const base =
  !rawBase || rawBase === "/"
    ? "/"
    : rawBase.endsWith("/")
      ? rawBase
      : `${rawBase}/`;
const basePath = base === "/" ? "" : base.replace(/\/$/, "");
const assetRoot = basePath ? `${basePath}/` : "/";

export default defineConfig({
  base,
  resolve: {
    alias: {
      "@rummagedeep/core": path.resolve(root, "../../packages/core/src/index.ts"),
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "RummageDeep — AI4Context",
        short_name: "RummageDeep",
        description:
          "Search deeper in long text and logs. By AI4Context. Local-first; no promise every string exists.",
        theme_color: "#764ba2",
        background_color: "#667eea",
        display: "standalone",
        start_url: base,
        icons: [
          {
            src: `${assetRoot}pwa-192.svg`,
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: `${assetRoot}pwa-512.svg`,
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
