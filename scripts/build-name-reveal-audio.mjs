import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const snapSrc = path.join(root, "public/sounds/card-snap.mp3");
const outSrc = path.join(root, "public/sounds/name-reveal-flips.mp3");

const HERO = "XEROURA" + "TECHNOLOGIES";
const SCRAMBLE_START_DELAY_S = 0.05;
const SCRAMBLE_LETTER_STAGGER_S = 0.08;
const SCRAMBLE_TICK_MS = 40;
const SCRAMBLE_TICK_COUNT = 7;
const SNAP_TICK_VOLUME = 0.42;
const SNAP_LOCK_VOLUME = 0.68;
const MIX_BOOST = 3.2;
const END_TRIM_S = 0.03;

/** Match hero-scramble.ts */
function buildEvents() {
  const events = [];
  for (let index = 0; index < HERO.length; index++) {
    const letterStartS = SCRAMBLE_START_DELAY_S + index * SCRAMBLE_LETTER_STAGGER_S;
    for (let tick = 0; tick < SCRAMBLE_TICK_COUNT; tick++) {
      events.push({
        timeS: letterStartS + (tick * SCRAMBLE_TICK_MS) / 1000,
        rate: 1.75,
        volume: SNAP_TICK_VOLUME,
      });
    }
    events.push({
      timeS: letterStartS + (SCRAMBLE_TICK_COUNT * SCRAMBLE_TICK_MS) / 1000,
      rate: 1.35,
      volume: SNAP_LOCK_VOLUME,
    });
  }
  return events;
}

const events = buildEvents();
const lastEventS = events[events.length - 1].timeS;
const snapTailS = 0.5 / 1.35;
const durationS = Math.max(0.5, lastEventS + snapTailS - END_TRIM_S);

const filterPath = path.join(root, "scripts/.name-reveal-filter.txt");
mkdirSync(path.dirname(filterPath), { recursive: true });

let filter = `[0:a]asplit=${events.length}${events.map((_, i) => `[s${i}]`).join("")};`;

for (let i = 0; i < events.length; i++) {
  const { timeS, rate, volume } = events[i];
  const delayMs = Math.round(timeS * 1000);
  filter += `[s${i}]atempo=${rate},volume=${volume},adelay=${delayMs}|${delayMs}[a${i}];`;
}

filter += `${events.map((_, i) => `[a${i}]`).join("")}`;
filter += `amix=inputs=${events.length}:duration=longest:dropout_transition=0:normalize=0,`;
filter += `volume=${MIX_BOOST},alimiter=limit=0.98:level=disabled,`;
filter += `atrim=0:${durationS.toFixed(3)},asetpts=PTS-STARTPTS[out]`;

writeFileSync(filterPath, filter);

const ffmpeg = ffmpegInstaller.path;
const result = spawnSync(
  ffmpeg,
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    snapSrc,
    "-filter_complex_script",
    filterPath,
    "-map",
    "[out]",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    outSrc,
  ],
  { stdio: "inherit" },
);

unlinkSync(filterPath);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Wrote ${outSrc} (${events.length} snaps, ${durationS.toFixed(3)}s)`);
