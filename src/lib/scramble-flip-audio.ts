import {
  SCRAMBLE_TICK_COUNT,
  SCRAMBLE_TICK_MS,
  heroLetterCount,
  scrambleLetterStartS,
} from "@/lib/hero-scramble";

/** Mixkit free SFX — royalty-free, no attribution required. */
export const SNAP_SRC = "/sounds/card-snap.mp3";

const SNAP_TICK_VOLUME = 0.275;
const SNAP_LOCK_VOLUME = 0.46;
const HERO_AUDIO_VISIBLE_RATIO = 0.45;

let primed = false;
let snapTemplate: HTMLAudioElement | null = null;
const scheduledTimeouts: number[] = [];

function getSnapTemplate() {
  if (typeof window === "undefined") return null;
  if (!snapTemplate) {
    snapTemplate = new Audio(SNAP_SRC);
    snapTemplate.preload = "auto";
    snapTemplate.load();
  }
  return snapTemplate;
}

async function unlockSnapPlayback() {
  const template = getSnapTemplate();
  if (!template) return false;

  template.volume = 0.01;
  template.muted = true;

  try {
    await template.play();
    template.pause();
    template.currentTime = 0;
    template.muted = false;
    template.volume = 1;
    primed = true;
    return true;
  } catch {
    template.muted = false;
    return false;
  }
}

/** Call as early as possible — works without a tap when navigation still has user activation. */
export async function primeScrambleAudio() {
  if (typeof window === "undefined") return false;
  getSnapTemplate();
  if (primed) return true;

  if (navigator.userActivation?.isActive) {
    const ok = await unlockSnapPlayback();
    if (ok) return true;
  }

  return primed;
}

/** Capture first interaction anywhere on the page to unlock audio for the name reveal. */
export function installScrambleAudioUnlock() {
  if (typeof window === "undefined") return () => {};

  const unlock = () => {
    void unlockSnapPlayback();
  };

  const opts: AddEventListenerOptions = { once: true, capture: true, passive: true };

  document.addEventListener("pointerdown", unlock, opts);
  document.addEventListener("touchstart", unlock, opts);
  document.addEventListener("keydown", unlock, opts);
  document.addEventListener("click", unlock, opts);

  void primeScrambleAudio();

  return () => {
    document.removeEventListener("pointerdown", unlock, opts);
    document.removeEventListener("touchstart", unlock, opts);
    document.removeEventListener("keydown", unlock, opts);
    document.removeEventListener("click", unlock, opts);
  };
}

function playSnap(volume: number, playbackRate = 1.35) {
  const audio = new Audio(SNAP_SRC);
  audio.volume = Math.min(1, volume);
  audio.playbackRate = playbackRate;
  void audio.play().catch(() => {});
}

export function cancelNameRevealFlipAudio() {
  for (const id of scheduledTimeouts) window.clearTimeout(id);
  scheduledTimeouts.length = 0;
}

function scheduleSnap(
  delayMs: number,
  volume: number,
  playbackRate: number,
  isAudible?: () => boolean,
) {
  const id = window.setTimeout(() => {
    if (isAudible && !isAudible()) return;
    playSnap(volume, playbackRate);
  }, delayMs);
  scheduledTimeouts.push(id);
}

export type NameRevealAudioOptions = {
  isAudible?: () => boolean;
};

export async function playNameRevealFlipAudio(options?: NameRevealAudioOptions) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cancelNameRevealFlipAudio();
  await primeScrambleAudio();

  const isAudible = options?.isAudible;
  const letterCount = heroLetterCount();

  for (let index = 0; index < letterCount; index++) {
    const letterStartMs = scrambleLetterStartS(index) * 1000;

    for (let tick = 0; tick < SCRAMBLE_TICK_COUNT; tick++) {
      scheduleSnap(
        letterStartMs + tick * SCRAMBLE_TICK_MS,
        SNAP_TICK_VOLUME,
        1.75,
        isAudible,
      );
    }

    const lockMs = letterStartMs + SCRAMBLE_TICK_COUNT * SCRAMBLE_TICK_MS;
    scheduleSnap(lockMs, SNAP_LOCK_VOLUME, 1.35, isAudible);
  }
}

export function createHeroAudioGate(heroEl: HTMLElement) {
  let heroVisible = true;
  let tabVisible = document.visibilityState === "visible";

  const observer = new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting && entry.intersectionRatio >= HERO_AUDIO_VISIBLE_RATIO;
      if (!heroVisible) cancelNameRevealFlipAudio();
    },
    { threshold: [0, HERO_AUDIO_VISIBLE_RATIO, 0.55, 1] },
  );
  observer.observe(heroEl);

  const onVisibilityChange = () => {
    tabVisible = document.visibilityState === "visible";
    if (!tabVisible) cancelNameRevealFlipAudio();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    isAudible: () => heroVisible && tabVisible,
    destroy: () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelNameRevealFlipAudio();
    },
  };
}
