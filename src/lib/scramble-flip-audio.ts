/** Pre-mixed flip sequence for the hero name reveal (see scripts/build-name-reveal-audio.mjs). */
export const NAME_REVEAL_SRC = "/sounds/name-reveal-flips.mp3";

const REVEAL_VOLUME = 1;
const HERO_AUDIO_VISIBLE_RATIO = 0.45;

let primed = false;
let revealAudio: HTMLAudioElement | null = null;

function getRevealAudio() {
  if (typeof window === "undefined") return null;
  if (!revealAudio) {
    revealAudio = new Audio(NAME_REVEAL_SRC);
    revealAudio.preload = "auto";
    revealAudio.load();
  }
  return revealAudio;
}

async function unlockRevealPlayback() {
  const audio = getRevealAudio();
  if (!audio) return false;

  audio.volume = 0.01;
  audio.muted = true;

  try {
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = REVEAL_VOLUME;
    primed = true;
    return true;
  } catch {
    audio.muted = false;
    return false;
  }
}

/** Call as early as possible — works without a tap when navigation still has user activation. */
export async function primeScrambleAudio() {
  if (typeof window === "undefined") return false;
  getRevealAudio();
  if (primed) return true;

  if (navigator.userActivation?.isActive) {
    const ok = await unlockRevealPlayback();
    if (ok) return true;
  }

  return primed;
}

/** Capture first interaction anywhere on the page to unlock audio for the name reveal. */
export function installScrambleAudioUnlock() {
  if (typeof window === "undefined") return () => {};

  const unlock = () => {
    void unlockRevealPlayback();
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

export function cancelNameRevealFlipAudio() {
  const audio = getRevealAudio();
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export type NameRevealAudioOptions = {
  isAudible?: () => boolean;
};

export async function playNameRevealFlipAudio(options?: NameRevealAudioOptions) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cancelNameRevealFlipAudio();
  await primeScrambleAudio();

  if (options?.isAudible && !options.isAudible()) return;

  const audio = getRevealAudio();
  if (!audio) return;

  audio.currentTime = 0;
  audio.volume = REVEAL_VOLUME;
  void audio.play().catch(() => {});
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
