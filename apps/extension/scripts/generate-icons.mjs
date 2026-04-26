/**
 * Rasterizes icons-source/rummagedeep.svg into icons/icon{16,32,48,128}.png
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(fileURLToPath(import.meta.url));
const extRoot = join(root, "..");
const svgPath = join(extRoot, "icons-source", "rummagedeep.svg");
const outDir = join(extRoot, "icons");

const svg = readFileSync(svgPath);
const sizes = [16, 32, 48, 128];

await Promise.all(
  sizes.map(async (size) => {
    const out = join(outDir, `icon${size}.png`);
    await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toFile(out);
    console.log("wrote", out);
  })
);
