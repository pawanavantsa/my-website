import sharp from "sharp";

const DIR = "public/products/devices";

function lum(d, i) {
  return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
}

/**
 * The screen is the only region that is black across almost a full row AND a
 * full column, so density profiles separate it from the equally dark bezel.
 */
async function screenRect(file, maxLum, fill) {
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const cols = new Int32Array(width);
  const rows = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (lum(data, (y * width + x) * channels) <= maxLum) {
        cols[x]++;
        rows[y]++;
      }
    }
  }

  const span = (profile, total, limit) => {
    const need = limit * total;
    let a = -1;
    let b = -1;
    for (let i = 0; i < profile.length; i++) {
      if (profile[i] >= need) {
        if (a === -1) a = i;
        b = i;
      }
    }
    return [a, b];
  };

  const [x0, x1] = span(cols, height, fill);
  const [y0, y1] = span(rows, width, fill);
  return { width, height, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

const pct = (v, total) => `${((v / total) * 100).toFixed(2)}%`;

function report(label, r) {
  console.log(`\n${label}  image ${r.width}x${r.height}  aspect ${(r.width / r.height).toFixed(4)}`);
  console.log(`  px   left=${r.x0} top=${r.y0} w=${r.w} h=${r.h}`);
  console.log(
    `  css  top: "${pct(r.y0, r.height)}", left: "${pct(r.x0, r.width)}", width: "${pct(r.w, r.width)}", height: "${pct(r.h, r.height)}"`,
  );
}

async function keyWhiteAndTrim(src, out) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const bg = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (bg[p]) return;
    if (lum(data, p * channels) < 232) return;
    bg[p] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  let x0 = width,
    y0 = height,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (bg[p]) {
        data[p * channels + 3] = 0;
      } else {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .png()
    .toFile(out);
  console.log(`\nkeyed + trimmed -> ${out} (${x1 - x0 + 1}x${y1 - y0 + 1})`);
}

for (const f of ["mbp-lid-front.png", "mbp-lid-back.png", "mbp-deck-top.png"]) {
  const m = await sharp(`${DIR}/${f}`).metadata();
  console.log(`${f}: ${m.width}x${m.height} aspect ${(m.width / m.height).toFixed(4)}`);
}

report("LID SCREEN", await screenRect(`${DIR}/mbp-lid-front.png`, 10, 0.9));

await keyWhiteAndTrim(`${DIR}/iphone-front-flat.png`, `${DIR}/iphone-flat.png`);
report("PHONE SCREEN", await screenRect(`${DIR}/iphone-flat.png`, 14, 0.9));
