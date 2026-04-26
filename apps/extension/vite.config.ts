import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

function copyIcons(): void {
  const from = resolve(root, "icons");
  const to = resolve(root, "public/icons");
  if (existsSync(from)) {
    cpSync(from, to, { recursive: true });
  }
}

export default defineConfig({
  root,
  base: "./",
  publicDir: "public",
  plugins: [
    {
      name: "copy-extension-icons",
      buildStart() {
        copyIcons();
      },
    },
  ],
  resolve: {
    alias: {
      "@rummagedeep/core": resolve(root, "../../packages/core/src/index.ts"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        panel: resolve(root, "panel.html"),
        content: resolve(root, "src/content.ts"),
        background: resolve(root, "src/background.ts"),
      },
      output: {
        entryFileNames(chunk) {
          if (chunk.name === "content") return "content.js";
          if (chunk.name === "background") return "background.js";
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
