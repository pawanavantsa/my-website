/**
 * Fits a generated 9:16 UI render to the iPhone content hole (AR 0.464) without
 * stretching: trims the intentional side margins, then extends top/bottom with
 * the render's own edge colour so the seam is invisible. The new bands get a
 * status bar and a gesture pill so they read as phone chrome, not letterboxing.
 *
 * usage: node scripts/fit-phone-screen.mjs <src> <dest> [sideTrim] [chromeColor]
 * sideTrim defaults to the 8% margin baked into our renders; pass 0 for real
 * screenshots whose content already runs edge to edge. Pass "none" as the
 * colour to skip the chrome (real screenshots ship with their own).
 */
import sharp from "sharp";

const TARGET_AR = 599 / 1291; // PHONE_SCREEN rect in iphone-flat.png
const TOP_SHARE = 0.55; // bias space to the status-bar side

const [src, dest, trimArg, chromeArg] = process.argv.slice(2);
if (!src || !dest) throw new Error("usage: fit-phone-screen.mjs <src> <dest>");
const sideTrim = trimArg === undefined ? 0.08 : Number(trimArg);
const chrome = chromeArg === "none" ? null : (chromeArg ?? "#FFFFFF");

const meta = await sharp(src).metadata();
const trim = Math.round(meta.width * sideTrim);
const width = meta.width - trim * 2;
const height = Math.round(width / TARGET_AR);
const grow = height - meta.height;
if (grow < 0) throw new Error(`${src} is already taller than the hole`);
const top = Math.round(grow * TOP_SHARE);
const bottom = grow - top;

const body = await sharp(src)
  .extract({ left: trim, top: 0, width, height: meta.height })
  .png()
  .toBuffer();

/** Mean colour of a band at the render's edge, so the extension is seamless. */
async function edgeColor(offset, band) {
  const { data } = await sharp(body)
    .extract({ left: 0, top: offset, width, height: band })
    .resize(1, 1, { kernel: "cubic" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

const band = (h, { r, g, b }) => ({
  create: { width, height: h, channels: 3, background: { r, g, b } },
});

/** iOS-style status row and gesture pill, sized off the screen's own width. */
function chromeSvg(tint) {
  const cy = Math.round(top * 0.4);
  const inset = Math.round(width * 0.06);
  const fontSize = Math.round(width * 0.035);

  const barX = width - inset - 33;
  const bars = [8, 12, 16, 20]
    .map(
      (h, i) =>
        `<rect x="${barX - 141 + i * 9}" y="${cy + 9 - h}" width="6" height="${h}" rx="2" fill="${tint}" opacity="${i === 3 ? 0.45 : 0.95}"/>`,
    )
    .join("");

  const wx = width - inset - 90;
  const wifi =
    `<path d="M ${wx - 17} ${cy - 3} a 24 24 0 0 1 34 0" fill="none" stroke="${tint}" stroke-width="4" stroke-linecap="round" opacity="0.95"/>` +
    `<path d="M ${wx - 10} ${cy + 5} a 14 14 0 0 1 20 0" fill="none" stroke="${tint}" stroke-width="4" stroke-linecap="round" opacity="0.95"/>` +
    `<circle cx="${wx}" cy="${cy + 13}" r="3.4" fill="${tint}" opacity="0.95"/>`;

  const bx = width - inset - 56;
  const battery =
    `<rect x="${bx}" y="${cy - 12}" width="52" height="25" rx="8" fill="none" stroke="${tint}" stroke-width="3" opacity="0.45"/>` +
    `<rect x="${bx + 5}" y="${cy - 7}" width="34" height="15" rx="4" fill="${tint}" opacity="0.95"/>` +
    `<rect x="${bx + 56}" y="${cy - 5}" width="4" height="11" rx="2" fill="${tint}" opacity="0.4"/>`;

  const pillW = Math.round(width * 0.35);
  const pillY = height - Math.round(bottom * 0.45);

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="${inset}" y="${cy + Math.round(fontSize * 0.36)}" fill="${tint}"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${fontSize}" font-weight="600" letter-spacing="0.4">9:41</text>
      ${bars}${wifi}${battery}
      <rect x="${Math.round((width - pillW) / 2)}" y="${pillY}" width="${pillW}"
        height="10" rx="5" fill="${tint}" opacity="0.8"/>
    </svg>`,
  );
}

const layers = [
  { input: band(top, await edgeColor(0, 6)), top: 0, left: 0 },
  { input: body, top, left: 0 },
  {
    input: band(bottom, await edgeColor(meta.height - 6, 6)),
    top: top + meta.height,
    left: 0,
  },
];
if (chrome) layers.push({ input: chromeSvg(chrome), top: 0, left: 0 });

await sharp({
  create: { width, height, channels: 3, background: "#000000" },
})
  .composite(layers)
  .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
  .toFile(dest);

console.log(`${dest} → ${width}x${height} (AR ${(width / height).toFixed(4)})`);
