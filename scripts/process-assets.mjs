/**
 * Generates:
 * - public/logo-transparent.png (near-white pixels → transparent)
 * - src/app/icon.png (48×48 tab icon from transparent logo)
 *
 * Run: npm run process:assets
 * Requires: sharp (devDependency)
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcLogo = join(root, "public", "logo.png");
const outTransparent = join(root, "public", "logo-transparent.png");
const srcInfinity = join(root, "public", "logo-infinity.png");
const outInfinityTransparent = join(root, "public", "logo-infinity-transparent.png");
const appDir = join(root, "src", "app");
const outIcon = join(appDir, "icon.png");

const WHITE = 248; // pixels >= this are treated as background

async function knockOutWhite(inputPath, outputPath, { trim = false } = {}) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) {
    throw new Error(`Expected 4 channels (RGBA), got ${channels}`);
  }
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= WHITE && g >= WHITE && b >= WHITE) {
      data[i + 3] = 0;
    }
  }
  let pipeline = sharp(data, { raw: { width, height, channels: 4 } });
  if (trim) {
    pipeline = pipeline.trim({ threshold: 10 });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
}

async function main() {
  if (!existsSync(srcLogo)) {
    console.warn("[process-assets] public/logo.png not found — skipping.");
    process.exit(0);
  }

  await knockOutWhite(srcLogo, outTransparent);
  console.log("[process-assets] Wrote", outTransparent);

  await mkdir(appDir, { recursive: true });
  await sharp(outTransparent)
    .resize(48, 48, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outIcon);
  console.log("[process-assets] Wrote", outIcon);

  if (existsSync(srcInfinity)) {
    await knockOutWhite(srcInfinity, outInfinityTransparent, { trim: true });
    console.log("[process-assets] Wrote", outInfinityTransparent);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
