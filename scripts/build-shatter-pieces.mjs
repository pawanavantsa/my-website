/**
 * Splits the shattered infinity render into its solid body and its individual
 * debris shards so the intro can animate the real asset instead of crossfading
 * between two different images.
 *
 * Output (public/):
 *   logo-shatter-body.png    — the mark with every loose shard removed
 *   logo-shatter-shards.png  — only the loose shards, in their final positions
 *   logo-shatter-shards.json — per-shard bounding box + centroid metadata
 *
 * body + shards composited additively at identity === the original render,
 * which keeps the resting frame pixel-aligned with the colour hover reveal.
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpeg = ffmpegInstaller.path;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SRC = path.join(root, "public/logo-shattered-dark.png");
const OUT_BODY = path.join(root, "public/logo-shatter-body.png");
const OUT_SHARDS = path.join(root, "public/logo-shatter-shards.png");
const OUT_DUST = path.join(root, "public/logo-shatter-dust.png");
const OUT_META = path.join(root, "public/logo-shatter-shards.json");

/** Above this channel value a pixel counts as material rather than backdrop. */
const THRESHOLD = 14;
/** Grow each labelled piece outward to pick up its own soft anti-aliased rim. */
const HALO_RADIUS = 3;
/** Components at least this large seed the solid mark. */
const BODY_MIN_PIXELS = 6000;
/**
 * Strand segments of the right loop sit right on the mark, so proximity — not
 * size — decides what is structure and what is debris.
 */
const BODY_DISTANCE = 12;
/** Beyond this size a detached piece gets its own animated trajectory. */
const MIN_SHARD_PIXELS = 10;
/** Distances are only needed near the mark. */
const MAX_DISTANCE = 96;

function probeSize(file) {
  const out = spawnSync(ffmpeg, ["-hide_banner", "-i", file], { encoding: "utf8" });
  const match = /,\s(\d+)x(\d+)[\s,]/.exec(out.stderr);
  if (!match) throw new Error(`Could not determine dimensions of ${file}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function decodeRgba(file, width, height) {
  const res = spawnSync(
    ffmpeg,
    ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
    { maxBuffer: width * height * 4 + 1024 },
  );
  if (res.status !== 0) throw new Error(res.stderr?.toString() ?? "ffmpeg decode failed");
  return res.stdout;
}

function encodeRgba(buffer, width, height, outFile) {
  const res = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      "-s",
      `${width}x${height}`,
      "-i",
      "-",
      "-frames:v",
      "1",
      outFile,
    ],
    { input: buffer },
  );
  if (res.status !== 0) throw new Error(res.stderr?.toString() ?? "ffmpeg encode failed");
}

const { width, height } = probeSize(SRC);
const pixels = decodeRgba(SRC, width, height);
const total = width * height;

const mask = new Uint8Array(total);
for (let i = 0; i < total; i++) {
  const o = i * 4;
  const v = Math.max(pixels[o], pixels[o + 1], pixels[o + 2]);
  if (v > THRESHOLD) mask[i] = 1;
}

// 8-connected labelling with an explicit stack (recursion blows up at 1024²).
const labels = new Int32Array(total).fill(-1);
const stack = new Int32Array(total);
const components = [];

for (let start = 0; start < total; start++) {
  if (!mask[start] || labels[start] !== -1) continue;

  const id = components.length;
  let top = 0;
  stack[top++] = start;
  labels[start] = id;

  let count = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let sumX = 0;
  let sumY = 0;

  while (top > 0) {
    const p = stack[--top];
    const x = p % width;
    const y = (p / width) | 0;

    count++;
    sumX += x;
    sumY += y;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;

    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const np = ny * width + nx;
        if (!mask[np] || labels[np] !== -1) continue;
        labels[np] = id;
        stack[top++] = np;
      }
    }
  }

  components.push({
    id,
    count,
    minX,
    minY,
    maxX,
    maxY,
    cx: sumX / count,
    cy: sumY / count,
  });
}

// Chebyshev distance out from the solid mark, used to separate structure from debris.
const coreIds = new Set(components.filter((c) => c.count >= BODY_MIN_PIXELS).map((c) => c.id));
const distance = new Int32Array(total).fill(-1);
{
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  for (let i = 0; i < total; i++) {
    if (labels[i] !== -1 && coreIds.has(labels[i])) {
      distance[i] = 0;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const p = queue[head++];
    const d = distance[p];
    if (d >= MAX_DISTANCE) continue;
    const x = p % width;
    const y = (p / width) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const np = ny * width + nx;
        if (distance[np] !== -1) continue;
        distance[np] = d + 1;
        queue[tail++] = np;
      }
    }
  }
}

const componentDistance = new Map();
for (let i = 0; i < total; i++) {
  const id = labels[i];
  if (id === -1 || coreIds.has(id)) continue;
  const d = distance[i] === -1 ? MAX_DISTANCE : distance[i];
  const prev = componentDistance.get(id);
  if (prev === undefined || d < prev) componentDistance.set(id, d);
}

// Grow labels into the surrounding soft pixels so shards keep their own glow.
let frontier = [];
for (let i = 0; i < total; i++) if (labels[i] !== -1) frontier.push(i);

for (let step = 0; step < HALO_RADIUS; step++) {
  const next = [];
  for (const p of frontier) {
    const x = p % width;
    const y = (p / width) | 0;
    const id = labels[p];
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const np = ny * width + nx;
        if (labels[np] !== -1) continue;
        labels[np] = id;
        next.push(np);
      }
    }
  }
  frontier = next;
}

const bodyIds = new Set();
const dustIds = new Set();
const shardList = [];
for (const c of components) {
  if (coreIds.has(c.id)) {
    bodyIds.add(c.id);
    continue;
  }
  const d = componentDistance.get(c.id) ?? MAX_DISTANCE;
  if (d <= BODY_DISTANCE) bodyIds.add(c.id);
  else if (c.count >= MIN_SHARD_PIXELS) shardList.push(c);
  else dustIds.add(c.id);
}

const shardIds = new Map();
shardList.forEach((c, index) => shardIds.set(c.id, index));

const bodyBuf = Buffer.alloc(total * 4);
const shardBuf = Buffer.alloc(total * 4);
const dustBuf = Buffer.alloc(total * 4);

// Halo growth can spill past the original bounds, so recompute from real output.
const bounds = shardList.map(() => ({
  minX: width,
  minY: height,
  maxX: -1,
  maxY: -1,
  sumX: 0,
  sumY: 0,
  n: 0,
}));

for (let i = 0; i < total; i++) {
  const o = i * 4;
  bodyBuf[o + 3] = 255;
  shardBuf[o + 3] = 255;
  dustBuf[o + 3] = 255;

  const id = labels[i];
  if (id === -1) continue;

  const shardIndex = shardIds.get(id);
  const target = shardIndex !== undefined ? shardBuf : dustIds.has(id) ? dustBuf : bodyBuf;

  target[o] = pixels[o];
  target[o + 1] = pixels[o + 1];
  target[o + 2] = pixels[o + 2];

  if (shardIndex !== undefined) {
    const x = i % width;
    const y = (i / width) | 0;
    const b = bounds[shardIndex];
    if (x < b.minX) b.minX = x;
    if (y < b.minY) b.minY = y;
    if (x > b.maxX) b.maxX = x;
    if (y > b.maxY) b.maxY = y;
    b.sumX += x;
    b.sumY += y;
    b.n++;
  }
}

encodeRgba(bodyBuf, width, height, OUT_BODY);
encodeRgba(shardBuf, width, height, OUT_SHARDS);
encodeRgba(dustBuf, width, height, OUT_DUST);

const shards = bounds
  .filter((b) => b.n > 0)
  .map((b) => ({
    x: b.minX,
    y: b.minY,
    w: b.maxX - b.minX + 1,
    h: b.maxY - b.minY + 1,
    cx: +(b.sumX / b.n).toFixed(1),
    cy: +(b.sumY / b.n).toFixed(1),
    n: b.n,
  }));

mkdirSync(path.dirname(OUT_META), { recursive: true });
writeFileSync(OUT_META, JSON.stringify({ width, height, shards }, null, 0));

console.log(`source           ${width}x${height}`);
console.log(`components       ${components.length}`);
console.log(`body components  ${bodyIds.size}`);
console.log(`animated shards  ${shards.length}`);
console.log(`dust specks      ${dustIds.size}`);
